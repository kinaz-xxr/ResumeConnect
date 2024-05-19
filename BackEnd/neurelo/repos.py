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
