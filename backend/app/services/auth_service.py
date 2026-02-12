from firebase_admin import auth as firebase_auth


def verify_token(token: str) -> dict:  # type: ignore[type-arg]
    return firebase_auth.verify_id_token(token)  # type: ignore[no-any-return]


def get_user_info(uid: str) -> dict:
    user = firebase_auth.get_user(uid)
    return {
        "uid": user.uid,
        "email": user.email,
        "display_name": user.display_name,
    }
