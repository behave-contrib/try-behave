# pylint: disable=E0401,E0611,C0114,C0116,E0102,W0613
from behave import given, step


@given('I connect to server')
def step_impl(context):
    context.server = TestObject()


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


def get_session_id():
    return str(ipaddress.IPv6Address(random.randint(0, 2**128-1)))

class PermissionError(Exception):
    def __init__(self, *args: object) -> None:
        super().__init__(*args)

class TestObject:

    def __init__(self) -> None:
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
        user["session"] = get_session_id()
        return user["session"]

    def logout(self, token) -> None:
        user = self.get_user(token)
        user["session"] = None

    def get_user_id(self, token) -> str:
        user = self.get_user(token)
        return user["user_login"]

    def get_user_name(self, token) -> str:
        user = self.get_user(token)
        return user["user_name"]

    def _find_user(self, login):
        return next(user for user in self._users if user["user_login"] == login)

    def get_user(self, token) -> Dict[str, str]:
        try:
            return next(user for user in self._users if user["session"] == token)
        except StopIteration:
            raise PermissionError("Not logged in")

    def _verify_admin(self, token):
        user = self.get_user(token)
        if "admin" not in user["user_rights"]:
            raise PermissionError("Not authorised")

    def get_all_users(self, token) -> List[Dict[str, str]]:
        self._verify_admin(token)
        return self._users

    def delete_user(self, token, login):
        self._verify_admin(token)
        user_to_delete = self._find_user(login)
        self._users.pop(user_to_delete)

    def put_user_password(self, token, new_password):
        user = self.get_user(token)
        user["user_password"] = new_password

    def put_user_name(self, token, name):
        user = self.get_user(token)
        user["user_name"] = name

    def put_user_right(self, token, login, right):
        self._verify_admin(token)
        user_to_modify = self._find_user(login)
        user_to_modify["user_rights"].append(right)

    def delete_user_right(self, token, login, right):
        self._verify_admin(token)
        user_to_modify = self._find_user(login)
        user_to_modify["user_rights"].pop(right)

    def post_new_user(self, token, name, login, password) -> str:
        self._verify_admin(token)
        self._users.append({"user_name": name, "user_login": login, 
                            "user_password": password, "session": get_session_id(),
                            "user_rights": []})
