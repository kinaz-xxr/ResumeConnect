import requests
import json
import os
import uuid
from dotenv import load_dotenv

class Api:
    # curl -X POST https://$ENV_API_URL/rest/user/__one
    # --url-query select='{"$scalars":true}'
    # --json '{name: "Admin User", country: "United States"}'

    def upload_resume(self, uuid: str, s3_url: str, comment = []):
        url = "https://us-west-2.aws.neurelo.com/rest/resume/__one?"
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY"),
            "Content-Type": "application/json"
        }

        data = {
            "uuid": uuid,
            "url": s3_url
        }

        response = requests.post(url, headers=headers, data=json.dumps(data))   


    def get_comment_by_comment_uuid(self, list_of_uuid: [str]): 
        url = "https://us-west-2.aws.neurelo.com/rest/comment/__groupBy"
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY")
        }
        print(list_of_uuid)
        params = {
            "select": '{"content": true, "resume_uuid": true, "uuid": true, "timestamp": true}',
            "group_by": '["content", "resume_uuid", "uuid", "timestamp"]',
            "filter": '{"uuid": {"in":' + str(list_of_uuid) + '}}'
        }
        print(params)
        response = requests.get(url, headers=headers, params=params)
        print(response.json())
        content_of_comments = []
        for comments in response.data:
            content_of_comments.append(comments.content)

        return content_of_comments


    def add_comments(self, resume_uuid: str, content: str):
        url = "https://us-west-2.aws.neurelo.com/rest/comment/__one?"
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY"),
            "Content-Type": "application/json"
        }


        comment_uuid = str(uuid.uuid4())
        data = {
            "resume": {"connect": {"uuid": resume_uuid}},
            "content": content,
            "uuid": comment_uuid,
            "timestamp": 123123123
        }

        response = requests.post(url, headers=headers, json=data)

    def get_comment_by_resume_uuid(self, resume_uuid: str): 
        print(resume_uuid)
        url = "https://us-west-2.aws.neurelo.com/rest/comment"
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY")
        }

        params = {
            'filter': json.dumps({
                'resume_uuid': {
                    'equals': str(resume_uuid)
                }
            })
        }

        response = requests.get(url, headers=headers, params=params)
        print(response.status_code)
        print(response.json())
        return response.json()
    
    def get_resume_from_uuid(self, uuid: str):
        url = "https://us-west-2.aws.neurelo.com/rest/resume/" + uuid
        print(url)
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY")
        }

        response = requests.get(url, headers=headers)

        return response.json()


        
