from flask import Flask, request
from flask_cors import CORS
import uuid
import boto3
from botocore.client import Config
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
s3 = boto3.client('s3', aws_access_key_id = os.environ.get("AWS_ACCESS_KEY"), 
                        aws_secret_access_key = os.environ.get("AWS_SECRET_ACCESS_KEY"), 
                        config=Config(signature_version='s3v4', region_name="us-east-2"))
app.config['CORS_HEADERS'] = 'Content-Type'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}

load_dotenv('./.env')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

#Use cloudfront presigned urls instead to avoid expiration? 
def create_presigned_url(s3_object_name: str):
   return s3.generate_presigned_url('get_object', Params = {"Bucket": os.environ.get("AWS_BUCKET_NAME"),
                                                            "Key": s3_object_name}, ExpiresIn=604800)

@app.route("/upload", methods=["POST", "OPTIONS", "GET"])
def upload():
    if request.method == "POST":
        if 'file' not in request.files:
            return "No file part", 400

        file = request.files['file']
        if file.filename == '':
            return "No selected file", 400

        if file and allowed_file(file.filename):
            file_uuid = uuid.uuid4()
            filename = str(file_uuid) + "_" + file.filename
            s3.upload_fileobj(file, "resumenetworkmainresumebucket", filename)
            presigned_url = create_presigned_url(filename)
            print(presigned_url)
            return "File successfully uploaded", 200
        else:
            return "File type not allowed", 400


if __name__ == "__main__":
    app.run(debug=True)
