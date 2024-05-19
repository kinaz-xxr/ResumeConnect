from flask import Flask, request, send_file, abort, jsonify
from flask_cors import CORS
import uuid
import boto3
from botocore.client import Config
from botocore.exceptions import NoCredentialsError, PartialCredentialsError
import os
from dotenv import load_dotenv
from io import BytesIO
import re
from BackEnd.neurelo.repos import Api

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
ALLOWED_EXTENSIONS = {"txt", "pdf", "png", "jpg", "jpeg", "gif"}

load_dotenv("./.env")


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Use cloudfront presigned urls instead to avoid expiration?
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

            api.upload_resume(uuid = str(file_uuid), url = presigned_url)
            return (
                jsonify(
                    {
                        "s3URL": presigned_url,
                    }
                ),
                200,
            )
        else:
            return "File type not allowed", 400


# get the pdf file from the s3 bucket
@app.route("/getFile", methods=["GET"])
def getFile():
    s3URL = request.args.get("s3URL")

    if not s3URL:
        return abort(400, "Missing s3 URL in the query parameter")

    parts = s3URL.split("/")

    if not parts:
        return abort(400, "Invalid S3 URL format.")

    # Extract bucket name and object key
    bucketName = parts[2].split(".")[0]
    objectKey = "/".join(parts[3:])

    try:
        s3Object = s3.get_object(Bucket=bucketName, Key=objectKey)
        fileData = s3Object["Body"].read()
        fileStream = BytesIO(fileData)
        fileStream.seek(0)
        return send_file(
            fileStream,
            as_attachment=True,
            download_name=objectKey.split("/")[-1],
            mimetype="application/pdf",
        )

    except s3.exceptions.NoSuchKey:
        return abort(404, "File not found in the S3 Bucket")
    except (NoCredentialsError, PartialCredentialsError):
        return abort(403, "AWS credentials not found or incomplete")
    except Exception as e:
        return abort(500, f"Something wrong happened in the server: {e}")


# send the chosen comments to process
@app.route("/process", methods=["POST"])
def postComments():
    try:
        if not request.is_json:
            return abort(400, "Request body must be JSON")

        data = request.json
        s3URL, commentUUIDs = data["s3URL"], data["commentUUIDs"]
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

            # query the list of comments associate with the UUIDs from the database
            return api.get_comment_by_uuid(commentUUIDs)

        except s3.exceptions.NoSuchKey:
            return abort(404, "File not found in the S3 Bucket")
        except (NoCredentialsError, PartialCredentialsError):
            return abort(403, "AWS credentials not found or incomplete")

    except Exception as e:
        return abort(500, f"Something wrong happened in the server: {e}")


if __name__ == "__main__":
    app.run(debug=True)
