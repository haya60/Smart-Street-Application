import streamlit as st
import cv2
import os
import time
from datetime import datetime
import numpy as np
import csv
import torch
from ultralytics import YOLO
import tempfile
from playsound import playsound
import pygame



model = YOLO(r'C:\Users\DELL\OneDrive\Documents\final_project-T5\smart_street_app\my-app2\api\venv\best (1).pt')


line_color = (255, 255, 0) #***
car_color = (201, 211, 220)
violation_color = (0, 0, 255)
plate_color = (207, 80, 209)


SAVE_DIR = 'processed_videos'
os.makedirs(SAVE_DIR, exist_ok=True)


st.title("Vehicle Violation Detection Live Stream")


def calculate_center(bbox):
    center_x = round(float((bbox[0][0] + bbox[0][2]) / 2))
    center_y = round(float((bbox[0][1] + bbox[0][3]) / 2))
    return center_x, center_y

def calculate_frame_center(frame):
    height = frame.shape[0]
    width = frame.shape[1]
    center_x = round(width / 2)
    center_y = round(height / 2)
    return center_x, center_y

def middel_line_in_image(frame):
    height = frame.shape[0]
    width = frame.shape[1]
    start_point = (width // 2, 0)
    end_point = (width // 2, height)
    return start_point, end_point

def is_line_in_left(frame_center, line_center):
    return line_center > frame_center

def is_line_in_right(frame_center, line_center):
    return line_center < frame_center

def is_violate_left(car_center , line_center):
      return car_center > line_center

def is_violate_right(car_center , line_center):
  return line_center > car_center


def play_sound(file_path: str) -> None:
    try:
        # Initialize the mixer
        pygame.mixer.init()
        
        # Load and play the sound
        pygame.mixer.music.load(file_path)
        pygame.mixer.music.play()

        # Wait for the sound to finish playing
        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)

    except pygame.error as e:
        print(f"An error occurred: {e}")


frame_placeholder = st.empty()


def generate_frames():
    camera = cv2.VideoCapture(0)  

    if not camera.isOpened():
        st.error("Error: Could not open video source.")
        return


    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
    frame_width = int(camera.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(camera.get(cv2.CAP_PROP_FRAME_HEIGHT))

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    video_writer = cv2.VideoWriter(temp_file.name, fourcc, 20.0, (frame_width, frame_height))

    while True:
        success, frame = camera.read()
        if not success:
            break


        frame_center = calculate_frame_center(frame)
        results = model.predict(frame, conf=0.1)
        line_exist = False


        for result in results:
            if result.masks is not None:
                for mask, box in zip(result.masks.xy, result.boxes):
                    if int(box.cls[0]) == 3:  # Line detected
                        line_exist = True
                        line_center = calculate_center(box.xyxy)
                        points = np.int32([mask])
                        cv2.polylines(frame, points, isClosed=True, color=line_color, thickness=2)
                        x1_line, y1_line, x2_line, y2_line = map(int, box.xyxy[0])

        for result in results:
            if result.masks is not None:
                for mask, box in zip(result.masks.xy, result.boxes):
                    if int(box.cls[0]) == 1 or int(box.cls[0]) == 0 or int(box.cls[0]) == 4:  # Vehicles
                        points = np.int32([mask])
                        x1_car, y1_car, x2_car, y2_car = map(int, box.xyxy[0])
                        car_center = calculate_center(box.xyxy)
                        cv2.circle(frame,car_center, 10, (255, 255, 0), -1)

                        if line_exist:
                            if is_line_in_left(frame_center, line_center):
                                if is_violate_left(car_center, line_center):
                                    print('************ violation detected ***************')
                                    cv2.rectangle(frame, (x1_car, y1_car), (x2_car, y2_car), violation_color, 3)
                                    play_sound(r'C:\Users\DELL\OneDrive\Documents\final_project-T5\smart_street_app_2\my-app3\alarm (1).mp3')


                            if is_line_in_right(frame_center, line_center):
                                if is_violate_right(car_center, line_center):
                                    print('************ violation detected ***************')
                                    cv2.rectangle(frame, (x1_car, y1_car), (x2_car, y2_car), violation_color, 3)
                                    play_sound(r'C:\Users\DELL\OneDrive\Documents\final_project-T5\smart_street_app_2\my-app3\alarm (1).mp3')


        frame_placeholder.image(frame, channels="BGR", caption="Smart Street Live Streaming")
        video_writer.write(frame)


    video_writer.release()
    camera.release()

# Stream the video frames in Streamlit
if st.button("Start Live Stream"):
    generate_frames()

if st.button("Stop Live Stream"):
    st.write("Live stream stopped.")