import face_recognition
import cv2
import os
import numpy as np

KNOWN_FACES_DIR = "test_images/known_faces"

known_encodings = []
known_names = []

print("Loading known faces...")
for filename in os.listdir(KNOWN_FACES_DIR):
    path = os.path.join(KNOWN_FACES_DIR, filename)
    image = face_recognition.load_image_file(path)
    encodings = face_recognition.face_encodings(image)
    if len(encodings) == 0:
        print(f"WARNING: No face found in {filename}, skipping")
        continue
    known_encodings.append(encodings[0])
    name = os.path.splitext(filename)[0]
    known_names.append(name)
    print(f"Loaded: {name}")

if not known_encodings:
    print("No known faces loaded. Add photos to test_images/known_faces/ first.")
    exit()

print("Starting webcam... press 'q' to quit")
video = cv2.VideoCapture(0)

while True:
    ret, frame = video.read()
    if not ret:
        break

    # Resize for faster processing
    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
        distances = face_recognition.face_distance(known_encodings, face_encoding)
        best_match_index = np.argmin(distances)
        best_distance = distances[best_match_index]

        if best_distance <= 0.6:
            name = known_names[best_match_index]
            confidence = round((1 - best_distance) * 100, 1)
            label = f"{name} ({confidence}%)"
            color = (0, 255, 0)  # green
        else:
            label = "Unknown"
            color = (0, 0, 255)  # red

        # Scale back up since frame was resized by 0.25
        top *= 4
        right *= 4
        bottom *= 4
        left *= 4

        cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
        cv2.putText(frame, label, (left, top - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    cv2.imshow("Face Recognition Test", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

video.release()
cv2.destroyAllWindows()