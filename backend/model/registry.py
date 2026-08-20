import os
import json
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VERSIONS_DIR = os.path.join(BASE_DIR, "versions")
LEGACY_DIR = os.path.join(BASE_DIR, "..", "models")

os.makedirs(VERSIONS_DIR, exist_ok=True)
os.makedirs(LEGACY_DIR, exist_ok=True)

ACTIVE_CONF_PATH = os.path.join(VERSIONS_DIR, "active.json")


def _read_active_map():
    if os.path.exists(ACTIVE_CONF_PATH):
        try:
            with open(ACTIVE_CONF_PATH, "r") as f:
                conf = json.load(f)
                return conf.get("active_versions", {})
        except Exception:
            return {}
    return {}


def get_active_version_id(institution_id: int | None = None) -> str | None:
    """Read the active version ID from config, falling back to the latest metadata timestamp."""
    active_map = _read_active_map()
    key = str(institution_id) if institution_id is not None else None
    v_id = active_map.get(key) if key else None
    if v_id and os.path.exists(os.path.join(VERSIONS_DIR, f"{v_id}_model.pkl")):
        return v_id

    # Fallback to the latest version by metadata training_date
    versions = list_versions(institution_id=institution_id)
    if versions:
        return versions[0]["version_id"]
    return None


def get_active_model(institution_id: int | None = None) -> tuple[any, any]:
    """
    Loads and returns the active model and scaler.
    Falls back to legacy models/ folder if no versions exist.
    """
    v_id = get_active_version_id(institution_id=institution_id)

    if v_id:
        model_path  = os.path.join(VERSIONS_DIR, f"{v_id}_model.pkl")
        scaler_path = os.path.join(VERSIONS_DIR, f"{v_id}_scaler.pkl")
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            print(f"[REGISTRY] Loading active model version: {v_id}")
            model  = joblib.load(model_path)
            scaler = joblib.load(scaler_path)
            return model, scaler

    # Legacy fallback
    legacy_model_path  = os.path.join(LEGACY_DIR, "dropout_model.pkl")
    legacy_scaler_path = os.path.join(LEGACY_DIR, "scaler.pkl")

    if os.path.exists(legacy_model_path) and os.path.exists(legacy_scaler_path):
        print("[REGISTRY] Loading legacy fallback model")
        model  = joblib.load(legacy_model_path)
        scaler = joblib.load(legacy_scaler_path)
        return model, scaler

    raise FileNotFoundError("No trained model versions or fallback model found. Retrain required.")


def list_versions(institution_id: int | None = None) -> list[dict]:
    """Scan versions directory and return a list of metadata for all trained versions."""
    versions = []
    if not os.path.exists(VERSIONS_DIR):
        return []

    # Read active config
    active_id = _read_active_map().get(str(institution_id)) if institution_id is not None else None

    # Look for metadata files
    for filename in os.listdir(VERSIONS_DIR):
        if filename.endswith("_metadata.json"):
            v_id = filename.replace("_metadata.json", "")
            meta_path = os.path.join(VERSIONS_DIR, filename)
            try:
                with open(meta_path, "r") as f:
                    meta = json.load(f)
                    meta_inst = meta.get("institution_id")
                    # A model with no institution_id is treated as global (institution 1).
                    # Filter only when the caller explicitly specifies an institution_id.
                    if institution_id is not None and meta_inst is not None:
                        if int(meta_inst) != int(institution_id):
                            continue
                    meta["version_id"] = v_id
                    # If active.json is missing or corrupted, default active to the latest
                    meta["active"] = (v_id == active_id)
                    versions.append(meta)
            except Exception:
                pass

    # Sort by training date descending
    versions.sort(key=lambda x: x.get("training_date", ""), reverse=True)

    # If nothing is explicitly marked active in active.json, mark the latest one active
    if versions and not any(v["active"] for v in versions):
        versions[0]["active"] = True

    return versions


def set_active_version(version_id: str, institution_id: int):
    """Updates active.json configuration to point to a specific version ID."""
    model_path = os.path.join(VERSIONS_DIR, f"{version_id}_model.pkl")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model version {version_id} does not exist.")

    active_map = _read_active_map()
    active_map[str(institution_id)] = version_id
    with open(ACTIVE_CONF_PATH, "w") as f:
        json.dump({"active_versions": active_map}, f, indent=2)
    print(f"[REGISTRY] Set active model version for institution {institution_id} to: {version_id}")
