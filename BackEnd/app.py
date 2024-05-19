from flask import Flask, request, send_file, abort, jsonify
from flask_cors import CORS
import uuid
import boto3
from botocore.client import Config
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import os
from dotenv import load_dotenv
from io import BytesIO
from BackEnd.neurelo.repos import Api
import subprocess

from BackEnd.utils import get_latex, allowed_file, latex_to_pdf

app = Flask(__name__)

api = Api()
CORS(app)
s3 = boto3.client(
    "s3",
    aws_access_key_id=os.environ.get("AWS_ACCESS_KEY"),
    aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY"),
    config=Config(signature_version="s3v4", region_name="us-east-2"),
)
app.config["CORS_HEADERS"] = "Content-Type"
load_dotenv("./.env")

def create_presigned_url(s3_object_name: str):
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": os.environ.get("AWS_BUCKET_NAME"), "Key": s3_object_name},
        ExpiresIn=604800,
    )

@app.route("/upload", methods=["POST", "OPTIONS", "GET"])
def upload():
    if request.method == "POST":
        if "file" not in request.files:
            return "No file part", 400

        file = request.files["file"]
        if file.filename == "":
            return "No selected file", 400

        if file and allowed_file(file.filename):
            file_uuid = uuid.uuid4()
            filename = str(file_uuid) + "_" + file.filename
            s3.upload_fileobj(file, "resumenetworkmainresumebucket", filename)
            presigned_url = create_presigned_url(filename)  

            api.upload_resume(uuid = str(file_uuid), s3_url = presigned_url)
            return (
                jsonify(
                    {
                        "uuid": file_uuid
                    }
                ),
                200,
            )
        else:
            return "File type not allowed", 400


# get the pdf file from the s3 bucket
@app.route("/getS3URL", methods=["GET"])
def getS3URL():
    uuid = request.args.get("uuid") 
    # get s3 link by uuid
    s3URL = api.get_resume_from_uuid(uuid=uuid)["data"]["url"]
    if not s3URL:
        return abort(400, "Missing s3 URL in the query parameter")
    # Check if the URL contains query parameters
    if '?' in s3URL:
        # Split the URL by '?'
        url_parts = s3URL.split('?')

        # Extract the base URL containing the bucket name and object key
        base_url = url_parts[0]

        # Extract the query parameters
        query_params = url_parts[1]

        # Split the base URL by '/'
        base_url_parts = base_url.split('/')

        # Extract bucket name and object key
        bucketName = base_url_parts[2].split('.')[0]
        objectKey = '/'.join(base_url_parts[3:])  # Exclude the empty string at the beginning

    else:
        # Split the URL by '/'
        parts = s3URL.split('/')

        # Extract bucket name and object key
        bucketName = parts[2].split('.')[0]
        objectKey = '/'.join(parts[3:])

    try:
        # get the file from s3
        s3Object = s3.get_object(Bucket=bucketName, Key=objectKey)
        fileData = s3Object["Body"].read().decode("utf-8")

        with open('temp.tex', 'w') as f:
            f.write(fileData)
        # Run pdflatex to convert .tex to .pdf
        subprocess.run(['pdflatex', '-interaction=nonstopmode', 'temp.tex'], capture_output=True)
        # Clean up temporary files
        subprocess.run(['rm', 'temp.tex', 'temp.log'])

        response = send_file(
            "temp.pdf",
            as_attachment=True,
            download_name="output.pdf",
            mimetype="application/pdf"
        )

        # delete the temp pdf file after sending the response
        # os.remove(outputFile)

        return response

    except s3.exceptions.NoSuchKey:
        return abort(404, "File not found in the S3 Bucket")
    except (NoCredentialsError, PartialCredentialsError):
        return abort(403, "AWS credentials not found or incomplete")
    except Exception as e:
        return abort(500, f"Something wrong happened in the server: {e}")

# create an endpoint for sending the comments
@app.route("/add_comments", methods=["POST"])
def postComments():
    try:
        if not request.is_json:
            return abort(400, "Request body must be JSON")
        
        data = request.json
        comment, resumeId = data["comment"], data["resumeId"]
        
        # put this into the database
        api.add_comments(resume_uuid=resumeId, content=comment) 
        return jsonify({
            "message" : "Comment saved sucessfully into the database"
        }), 200

    except Exception as e:
        return abort(500, f"Something wrong happened in the server: {e}")

@app.route("/get_comments", methods=["GET"])
def getComments():
    resume_uuid = request.args.get('uuid')
    return api.get_comment_by_resume_uuid(resume_uuid)
        

# send the chosen comments to process
@app.route("/process", methods=["POST"])
def process():
    try:
        if not request.is_json:
            return abort(400, "Request body must be JSON")

        data = request.json
        s3URL, comments= data["s3URL"], data["comment"]
        parts = s3URL.split("/")

        if not parts:
            return abort(400, "Invalid S3 URL format.")

        bucketName = parts[2].split(".")[0]
        objectKey = "/".join(parts[3:])

        try:
            # get the file from s3
            s3Object = s3.get_object(Bucket=bucketName, Key=objectKey)
            fileData = s3Object["Body"].read()
            fileStream = BytesIO(fileData)
            fileStream.seek(0)

        
            latexResult = get_latex(comments, fileStream)
            
            # convert this latex string to pdf file
            outputFile = "output.pdf"
            latex_to_pdf(latexResult, outputFile)
            response = send_file(
                outputFile,
                as_attachment=True,
                mimetype="application/pdf"
            )

            # delete the temp pdf file after sending the response
            os.remove(outputFile)

            return response

        except s3.exceptions.NoSuchKey:
            return abort(404, "File not found in the S3 Bucket")
        except (NoCredentialsError, PartialCredentialsError):
            return abort(403, "AWS credentials not found or incomplete")

    except Exception as e:
        return abort(500, f"Something wrong happened in the server: {e}")


if __name__ == "__main__":
    app.run(debug=True)
