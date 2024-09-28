import os
import cv2
from flask import Flask, Response, request, jsonify, send_from_directory
from datetime import datetime
import numpy as np
import csv
import torch
from ultralytics import YOLO

def calculate_center(bbox):
    center_x = round(float((bbox[0][0]+ bbox[0][2]) / 2))
    center_y = round(float((bbox[0][1] + bbox[0][3]) / 2))
    return center_x, center_y

def calculate_frame_center(frame):
    hight = frame.shape[0]
    width = frame.shape[1]
    center_x = round(width/ 2)
    center_y = round(hight/ 2)
    return center_x, center_y

def middel_line_in_image(frame):
    height = frame.shape[0]
    width = frame.shape[1]
    start_point = (width // 2 , 0)
    end_point = (width // 2 , height)
    return start_point, end_point

def is_line_in_left(frame_center, line_center):
      return line_center > frame_center

def is_line_in_right(frame_center, line_center):
  return line_center < frame_center

def check_edge_left(car_x_edge, line_x_edg):
      return car_x_edge > line_x_edg

def check_edge_right(car_x_edge, line_x_edg):
  return car_x_edge < line_x_edg

def check_distance_left(x_car, x_line):
  diffrence = x_car - x_line
  result = True
  if diffrence >= 10:
    result = False
  return result

def check_distance_right(x_car, x_line):
  diffrence = x_line - x_car
  result = True
  if diffrence >= 10:
    result = False
  return result



model = YOLO(r'C:\Users\DELL\OneDrive\Documents\final_project-T5\smart_street_app\my-app2\api\venv\best (1).pt')

line_color = (255, 208, 0)
car_color = (201, 211, 220)
violation_color = (0, 0, 255)
plate_color = (207, 80, 209)


app = Flask(__name__)

SAVE_DIR = os.path.join(os.path.dirname(__file__), 'processed_videos')
os.makedirs(SAVE_DIR, exist_ok=True)

video_writer = None
output_path = None

# Start live stream and save the video when stream stops
@app.route('/stream', methods=['POST'])
def stream_video():
    global video_writer, output_path

    camera = cv2.VideoCapture(0)  

    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    frame_width = int(camera.get(3))
    frame_height = int(camera.get(4))
    output_filename = "output_video.mp4"
    output_path = os.path.join(SAVE_DIR, output_filename)
    video_writer = cv2.VideoWriter(output_path, fourcc, 20.0, (frame_width, frame_height))

    def generate_frames():
        while True:
            success, frame = camera.read()
            if not success:
                break
            

            frame_center = calculate_frame_center(frame)

            results = model.predict(frame)

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

                            # Only check for violations if a line has been detected
                            if line_exist:
                                if is_line_in_left(frame_center, line_center):
                                    if check_distance_left(car_center[0], line_center[0]):
                                        if check_edge_left((x2_car, y1_car), (x1_line, y1_line)):  # top_right of car / top left of line
                                            print('************ violation detected ***************')
                                            cv2.rectangle(frame, (x1_car, y1_car), (x2_car, y2_car), violation_color, 3)

                                if is_line_in_right(frame_center, line_center):
                                    if check_distance_right(car_center[0], line_center[0]):
                                        if check_edge_right((x1_car, y1_car), (x2_line, y1_line)):  # top left of car / top right of line
                                            print('************ violation detected ***************')
                                            cv2.rectangle(frame, (x1_car, y1_car), (x2_car, y2_car), violation_color, 3)   



            if video_writer:
                video_writer.write(frame)

            # Encode frame for live streaming
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()


            yield (b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# Stop live stream and close the video file
@app.route('/stop', methods=['POST'])
def stop_stream():
    global video_writer
    if video_writer is not None:
        video_writer.release()
        # video_writer = None
        video_url = f'http://172.20.10.3:5000/videos/{os.path.basename(output_path)}'
        return jsonify({"message": "Video saved", "video_path": video_url})


    else:
        return jsonify({"message": "No active video stream"}), 400

# Serve the saved video file
@app.route('/videos/<filename>', methods=['GET'])
def get_video(filename):
    return send_from_directory(SAVE_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
