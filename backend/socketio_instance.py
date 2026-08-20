"""
Shared Flask-SocketIO instance.

Defined in its own module so that batch_predict.py (and any other worker)
can `from socketio_instance import socketio` without pulling in the full app,
which would create a circular import.
"""
from flask_socketio import SocketIO

# async_mode='threading' is deliberately chosen over 'eventlet' so that
# APScheduler's BackgroundScheduler and the existing threading.Thread calls
# in app.py continue to work unmodified. eventlet monkey-patching would
# break standard-library threading used by APScheduler.
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="threading",
    logger=False,
    engineio_logger=False,
)
