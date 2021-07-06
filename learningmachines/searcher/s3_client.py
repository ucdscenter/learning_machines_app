import string
import os
import boto3

from learningmachines.credentials import  AWS_PROFILE
from learningmachines.cfg import TEMP_MODEL_FOLDER, S3_RNLP_DATA_DIR, S3_BUCKET


class S3Client:
    def __init__(self):
        self.client = boto3.client(
            's3',
            #aws_access_key_id=AWS_PROFILE['ACCESS_KEY'],
            #aws_secret_access_key=AWS_PROFILE['SECRET_KEY'],
            region_name='us-east-2'
        )
        self.bucket = S3_BUCKET

    def upload(self, local_file, remote_file):
        print("UPLOADING FILE")
        self.client.upload_file(local_file, self.bucket, remote_file)

    def upload_folder(self, folder_name):
        folder_path = os.path.join(TEMP_MODEL_FOLDER, folder_name)
        for file in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file)
            s3_path = os.path.join(S3_RNLP_DATA_DIR, folder_name, file)
            self.client.upload_file(file_path, self.bucket, s3_path)

    def download_file(self, remote_file, local_file):
        try:
            self.client.download_file(self.bucket, remote_file, local_file)
        except:
            raise
    def read_fileobj(self, file_path):
        prefix = os.path.join(S3_RNLP_DATA_DIR, file_path)
        print(prefix)
        obj_dict = self.client.get_object(Bucket=self.bucket, Key=prefix)
        return obj_dict["Body"]

    def upload_str(self, string_data, file_path):
        import io
        prefix = os.path.join(S3_RNLP_DATA_DIR, file_path)
        print(prefix)
        string_data = string_data.encode('utf-8')
        f = io.BytesIO(string_data)
        self.client.upload_fileobj(f, self.bucket, prefix)
        return 1

    def check_file_exists(self, file_path):
        prefix = os.path.join(S3_RNLP_DATA_DIR, file_path)
        print(prefix)
        try:
            file = self.client.head_object(Bucket=self.bucket, Key=prefix)
            return True
        except:
            return False


    def download_folder(self, folder_name):
        import json
        import hashlib
        prefix = os.path.join(S3_RNLP_DATA_DIR, folder_name) + '/'
        keys = self.client.list_objects(Bucket='rnlp-data', Prefix=prefix, Delimiter='/').get('Contents')
        for key in keys:
            file_path = key['Key']
            file_name = file_path.split('/')[-1]
            local_path = os.path.join(TEMP_MODEL_FOLDER, folder_name, file_name)
            local_folder = os.path.join(TEMP_MODEL_FOLDER, folder_name)
            if not os.path.exists(local_folder):
                os.mkdir(local_folder)
            s3_size = self.client.head_object(Bucket=self.bucket, Key=key['Key'])['ContentLength']
            num_download = 0
            max_download = 5
            while num_download < max_download:
                num_download += 1
                self.client.download_file(self.bucket, file_path, local_path)
                local_size = os.path.getsize(local_path)
                if s3_size == local_size:
                    break
                if num_download == max_download:
                    raise ConnectionError