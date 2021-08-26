from uuid import uuid4
from datetime import datetime
from time import time

import boto3
from boto3 import Session
from botocore.credentials import RefreshableCredentials
from botocore.session import get_session


# check for max session duration
# https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use.html#id_roles_use_view-role-max-session
TTL = 900  # default


class BotoSession:
    """
    Boto Helper class which lets us create refreshable session, so that we can cache the client or resource.
    Usage
    -----
    session = BotoSession().refreshable_session()
    client = session.client("s3") # we now can cache this client object without worrying about expiring credentials
    """

    def __init__(
        self,
        region_name: str = None,
        profile_name: str = None,
        sts_arn: str = None,
        session_name: str = None,
    ):
        """
        Initialize `BotoSession`
        Parameters
        ----------
        region : str (optional)
            Default region when creating new connection.
        profile_name : str (optional)
            The name of a profile to use.
        sts_arn : str (optional)
            The role arn to sts before creating session.
        session_name : str (optional)
            An identifier for the assumed role session. (required when `sts_arn` is given)
        """

        self.region_name = region_name
        self.profile_name = profile_name
        self.sts_arn = sts_arn

        # read why RoleSessionName is important https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/sts.html
        self.session_name = session_name or uuid4().hex

    def __get_session_credentials(self):
        """
        Get session credentials
        """
        credentials = {}
        session = Session(region_name=self.region_name, profile_name=self.profile_name)

        # if sts_arn is given, get credential by assuming given role
        if self.sts_arn:
            sts_client = session.client(self.service_name, region_name=self.region_name)
            response = sts_client.assume_role(
                RoleArn=self.role_arn,
                RoleSessionName=self.session_name,
                DurationSeconds=TTL,
            ).get("Credentials")

            credentials = {
                "access_key": response.get("AccessKeyId"),
                "secret_key": response.get("SecretAccessKey"),
                "token": response.get("SessionToken"),
                "expiry_time": response.get("Expiration").isoformat(),
            }
        else:
            session_credentials = session.get_credentials().__dict__
            credentials = {
                "access_key": session_credentials.get("access_key"),
                "secret_key": session_credentials.get("secret_key"),
                "token": session_credentials.get("token"),
                "expiry_time": (datetime.now(timezone.utc) + timedelta(minutes=15))#datetime.fromtimestamp(time() + TTL).isoformat(),
            }

        return credentials

    def refreshable_session(self) -> Session:
        """
        Get refreshable boto3 session.
        """
        try:
            # get refreshable credentials
            refreshable_credentials = RefreshableCredentials.create_from_metadata(
                metadata=self.__get_session_credentials(),
                refresh_using=self.__get_session_credentials,
                method="sts-assume-role",
            )

            # attach refreshable credentials current session
            session = get_session()
            session._credentials = refreshable_credentials
            session.set_config_variable("region", self.region_name)
            autorefresh_session = Session(botocore_session=session)

            return autorefresh_session

        except:
            return boto3.Session()