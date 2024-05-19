import requests
import json
import os
from dotenv import load_dotenv

class Api:
    # curl -X POST https://$ENV_API_URL/rest/user/__one
    # --url-query select='{"$scalars":true}'
    # --json '{name: "Admin User", country: "United States"}'

    def upload_resume(self, uuid: str, url: str, comment = []):
        url = "https://us-west-2.aws.neurelo.com/rest/resume/__one?"
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY"),
            "Content-Type": "application/json"
        }
        data = {
            "uuid": uuid,
            "url": url
        }

        response = requests.post(url, headers=headers, data=json.dumps(data))   

        print(response.status_code)
        print(response.text)

    def get_comment_by_uuid(self, list_of_uuid: [str]): 
        url = "https://us-west-2.aws.neurelo.com/rest/comment/__groupBy"
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY")
        }

        params = {
            "select": '{"content": true, "resume_uuid": true, "uuid": true, "timestamp": true}',
            "group_by": '["content", "resume_uuid", "uuid", "timestamp"]',
            "filter": '{"uuid": {"in":' + str(list_of_uuid) + '}}'
        }

        response = requests.get(url, headers=headers, params=params)

        print(response.status_code)
        print(response.text)

    def add_comments(self, resume_uuid: str):
        url = "https://us-west-2.aws.neurelo.com/rest/comment/__one?"
        headers = {
            "X-API-KEY": os.environ.get("NEURELO_API_KEY"),
            "Content-Type": "application/json"
        }
        data = {
            "resume": {"connect": {"uuid": "b1769692-74a2-4d45-a064-6990e2c07c31"}},
            "content": "does this work",
            "uuid": "uuid1",
            "timestamp": 123123123
        }

        response = requests.post(url, headers=headers, data=json.dumps(data))

        print(response.status_code)
        print(response.text)

        
