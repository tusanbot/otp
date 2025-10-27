import json

CUSTOMERS = [
    {"id": 1, "name": "علی احمدی", "phone": "09120000000"},
    {"id": 2, "name": "زهرا رضایی", "phone": "09121111111"},
]

def handler(request):
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(CUSTOMERS)
    }
