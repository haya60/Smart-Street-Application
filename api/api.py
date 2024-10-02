from flask import Flask, request, jsonify, send_from_directory
import numpy as np
import cv2
import os
import csv
import torch
from ultralytics import YOLO
from flask_cors import CORS
from deviceLocator import DeviceLocator


# define functions to be used 
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

app = Flask(__name__)
CORS(app)  



model = YOLO(r'C:\Users\DELL\OneDrive\Documents\final_project-T5\smart_street_app\my-app2\api\venv\best (1).pt')

line_color = (255, 208, 0)
car_color = (201, 211, 220)
violation_color = (0, 0, 255)
plate_color = (207, 80, 209)



# Directory to save processed videos
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'processed_videos')
os.makedirs(OUTPUT_DIR, exist_ok=True)

user_credentials = {'email': None, 'password': None}

@app.route('/update_credentials', methods=['POST'])
def update_credentials():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Store the credentials in the global variable (or better in a secure storage like a database)
    user_credentials['email'] = email
    user_credentials['password'] = password
    return jsonify({'success': True, 'message': 'Credentials updated successfully'}), 200

@app.route('/predict', methods=['POST'])
def predict():
    if 'video' not in request.files:
        return jsonify({'error': 'No video uploaded'}), 400

    video = request.files['video']

    # Save the video temporarily
    video_path = './temp_video.mp4'
    video.save(video_path)

    email = user_credentials.get('email')
    password = user_credentials.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password not found, please update your credentials'}), 400

    # Use the credentials with DeviceLocator
    locator = DeviceLocator(email, password)
    device = locator.get_device(2)

    # Process the video with OpenCV
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Define the codec and create VideoWriter object
    output_path = os.path.join(OUTPUT_DIR, 'output_video.mp4')
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
    
    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
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
                                            # Retrieve location info
                                            # street_name, neighborhood, city, postal_code, country, date, time, lan, long = locator.device_location(device)
                                            # # Add information to the CSV
                                            # violation_type = 'Crossing left shoulders'
                                            # if int(box.cls[0]) == 1:
                                            #     vehicle_type = 'Car'
                                            # elif int(box.cls[0]) == 0:
                                            #     vehicle_type = 'Bus'
                                            # elif int(box.cls[0]) == 4:
                                            #     vehicle_type = 'Truck'

                                            # row = [street_name, neighborhood, city, postal_code, country, date, time, lan, long, vehicle_type, violation_type]
                                            # with open('violation_data.csv', mode='a', newline='', encoding='utf-8') as file:
                                            #     writer = csv.writer(file)
                                            #     writer.writerow(row)

                                if is_line_in_right(frame_center, line_center):
                                    if check_distance_right(car_center[0], line_center[0]):
                                        if check_edge_right((x1_car, y1_car), (x2_line, y1_line)):  # top left of car / top right of line
                                            print('************ violation detected ***************')
                                            cv2.rectangle(frame, (x1_car, y1_car), (x2_car, y2_car), violation_color, 3)   
                                            # Retrieve location info
                                            # street_name, neighborhood, city, postal_code, country, date, time, lan, long = locator.device_location(device)

                                            # # Add information to the CSV
                                            # violation_type = 'Crossing right shoulders'
                                            # if int(box.cls[0]) == 1:
                                            #     vehicle_type = 'Car'
                                            # elif int(box.cls[0]) == 0:
                                            #     vehicle_type = 'Bus'
                                            # elif int(box.cls[0]) == 4:
                                            #     vehicle_type = 'Truck'

                                            # row = [street_name, neighborhood, city, postal_code, country, date, time, lan, long, vehicle_type, violation_type]
                                            # with open('violation_data.csv', mode='a', newline='', encoding='utf-8') as file:
                                            #     writer = csv.writer(file)
                                            #     writer.writerow(row)


        out.write(frame)
        frame_count += 1

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    print(f"Processed video saved at: {output_path}")

    return jsonify({'video_url': f'http://{request.host}/processed_videos/output_video.mp4'})

# Serve the processed video files
@app.route('/processed_videos/<path:filename>', methods=['GET'])
def send_processed_video(filename):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(OUTPUT_DIR, filename)
    else:
        return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)