import face_recognition
import numpy as np


def get_face_encoding(image_path):
    """Extract a face encoding from an image file. Returns None if no face found."""
    image = face_recognition.load_image_file(image_path)
    encodings = face_recognition.face_encodings(image)
    if len(encodings) == 0:
        return None
    return encodings[0].tolist()


def match_face(unknown_encoding, samples, tolerance=0.55):
    """samples: iterable of FaceSample. Returns (person, confidence, best_distance)."""
    valid = [s for s in samples if s.face_encoding]
    if not valid:
        return None, None, None

    known_encodings = [np.array(s.face_encoding) for s in valid]
    distances = face_recognition.face_distance(known_encodings, np.array(unknown_encoding))
    best_index = int(np.argmin(distances))
    best_distance = float(distances[best_index])

    if best_distance <= tolerance:
        confidence = round((1 - best_distance) * 100, 1)
        return valid[best_index].person, confidence, best_distance

    return None, None, best_distance