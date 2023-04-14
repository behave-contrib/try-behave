# pylint: disable=E0401,E0611,C0114,C0116,E0102,W0613
from behave import given, step


@given('I connect to server')
def step_impl(context):
    server: TestObject = TestObject(ip="fe80::aede:48ff:fe00:1122")
    context.server = server


@step('I create a user named "{name}" with username "{username}" and password "{password}"')
@step('I create a user with username "{username}" and password "{password}"')
def step_impl(context, username, password, name=""):
    server: TestObject = context.server
    session_id = server.authenticate("admin", "999123")
    server.post_new_user(token=session_id, name=name, login=username, password=password)
    context.server = server


@step('I login with user "{username}" and password "{password}"')
def step_impl(context, username, password):
    server: TestObject = context.server
    session_id = server.authenticate(username, password)
    context.session_id = session_id


@step('I verify valid login for "{name}"')
def step_impl(context, name):
    server: TestObject = context.server
    assert server.get_user(context.session_id) is not None


@step('I perform server operation "{operation_name}"')
def step_impl(context, operation_name):
    server: TestObject = context.server
    operation = getattr(server, operation_name)
    operation(context.session_id)


@step('I close server connection')
def step_impl(context):
    context.server = None


@step('I verify unauthorised access')
def step_impl(context):
    server: TestObject = context.server
    server.get_user(context.session_id, "phantom")


import ipaddress
import random
from typing import Dict, List


class PermissionError(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)

class TestObject:

    def __init__(self, ip) -> None:
        self.ip = ip
        self.version = "v1.0"
        self._users = [
            {
                "session": "b5e3:c196:1e0e:e1ba:8f1c:90b5:67d3:972",
                "user_name": "System adminstration",
                "user_login": "admin",
                "user_password": "999123",
                "user_rights": ["admin"]
            }
        ]

    def authenticate(self, login: str, password: str) -> str:
        # Simulate user db lookup
        user = next(user for user in self._users if user["user_login"] == login)
        if not user["user_password"] == password:
            raise Exception("Invalid Password")
        user["session"] = self._get_session_id()
        return user["session"]

    def logout(self, token) -> None:
        user = self.get_user(token)
        user["session"] = None

    def get_version(self, token) -> str:
        self.get_user(token)
        return self.version

    def get_user_id(self, token, login) -> str:
        user = self.get_user(token)
        return user["user_login"]

    def get_user_name(self, token, user_id) -> str:
        user = self.get_user(token)
        return user["user_name"]

    def get_user(self, token) -> Dict[str, str]:
        try:
            return next(user for user in self._users if user["session"] == token)
        except StopIteration:
            raise PermissionError("Not logged in")

    def _verify_admin(self, user):
        if "admin" not in user["user_rights"]:
            raise PermissionError("Not authorised")

    def get_all_users(self, token) -> List[Dict[str, str]]:
        user = self.get_user(token)
        self._verify_admin(user)
        return self._users

    def delete_user(self, token):
        user = self.get_user(token)
        self._users.pop(user)

    def put_user_password(self, token, new_password):
        user = self.get_user(token)
        user["user_password"] = new_password

    def put_user_name(self, token, name):
        user = self.get_user(token)
        user["user_name"] = name

    def put_user_right(self, token, right):
        user = self.get_user(token)
        user["user_rights"].append(right)

    def post_new_user(self, token, name, login, password) -> str:
        user = self.get_user(token)
        self._verify_admin(user)
        self._users.append({"user_name": name, "user_login": login, "user_password": password, "session": self._get_session_id(), "user_rights": []})

    def _get_session_id(self):
        return str(ipaddress.IPv6Address(random.randint(0, 2**128-1)))
