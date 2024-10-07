import os
import sys
from ultralytics import YOLO
import datetime as dt
import cv2
import numpy as np
import streamlit as st
import torch





def get_center(self, bbox: torch.Tensor):
        """
        the function takes a bounding box tensor and
        returns the center of the bounding box
        """
        #convert to numpy
        x1, y1, x2, y2 = bbox[0].numpy()
        #calculate x,y centers
        center_x = int((x1 + x2) / 2)
        center_y = int((y1 + y2) / 2)

        return (center_x, center_y)
    
def draw_bbox(self, frame: np.ndarray, bbox: torch.Tensor, color=(0, 0, 255), thickness: int =2):
        """
        the function draws a bounding box on an image
        we will use it to draw bounding boxes only on the violated cars
        """
        #convert to numpy
        pt1 = bbox.xywh[0][0:2].numpy()
        pt2 = bbox.xywh[0][2:4].numpy()
        #calculate top left and bottom right points
        top_left = (int(pt1[0] - pt2[0] / 2), int(pt1[1] - pt2[1] / 2))
        bottom_right = (int(pt1[0] + pt2[0] / 2), int(pt1[1] + pt2[1] / 2))
        #draw the bounding box
        cv2.rectangle(frame, top_left, bottom_right, color, thickness)
        return frame

def is_overtaking(self, vehicle_center: tuple, line_center: tuple, width=640):
        """
        the function takes a tuple of 'veicle' and 'solid-line' centers
        and checks if the vehicle is overtaking in non-permitted areas
        return True if the vehicle is overtaking, False otherwise
        """
        #we will set the threshold to be the half of the width
        threshold = int(width / 2)
        violation_type = ''
        is_overtaking = False
        #first get the line center position based on the x-axis
        if line_center[0] > threshold and vehicle_center[0] > line_center[0] - 65:
            #meaning that the line is on the right side
            is_overtaking = True
            violation_type = 'overtaking from the right'
        elif line_center[0] < threshold and vehicle_center[0] < line_center[0] + 65:
            #meaning that the line is on the left side
            # distance threshold
            is_overtaking = True
            violation_type = 'overtaking from the left'
        else:
            is_overtaking = False

        return is_overtaking, violation_type


date = dt.datetime.now().strftime('%Y-%m-%d')
start = dt.datetime.now()
# load model
model = YOLO(r'C:\Users\DELL\OneDrive\Documents\final_project-T5\smart_street_app\my-app2\api\venv\best (1).pt')

#start video capture form the camera
cap = cv2.VideoCapture(0)
assert cap.isOpened(), 'Cannot capture video'

#video properties
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = int(cap.get(cv2.CAP_PROP_FPS))
print(f"width: {width}, height: {height}, fps: {fps}")

#video writer
output_path = f'../resources/OUTPUT_LIVE_VIDEO{dt.datetime.now().strftime("%Y-%m-%d %H_%M")}.avi'
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter(output_path, fourcc, 20.0, (640, 480))

#counter to index saved images
counter = 0

# initial values for center points
line_center = (1, 1)
vehicle_center = (1, 1)

#placeholder for the frame
frame_placeholder = st.empty()

#initial value for license plate number
license_plate_number = None


while cap.isOpened():

    #start capturing from the camera
    success, frame = cap.read()

    #end of capturing
    if not success:
        break

    #write the current time and date on the bottom left of the frame
    current_time = dt.datetime.now()
    text = current_time.strftime('%Y-%m-%d %H:%M:%S')
    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 2, 5)[0]

    cv2.putText(frame, text, (5, height - 20), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    #send frames to the model
    results = model(frame, conf=0.4, imgsz=640)

    try:
        for box, mask in zip(results[0].boxes, results[0].masks.xy):

            # class 2 solid-yellow-line detected
            if int(box.cls.item()) == 2:
                #get the center of the solid-yellow-line
                line_center = get_center(box.xyxy)
                #fill the mask points with yellow color
                mask_points = np.int32([mask])
                cv2.fillPoly(frame, mask_points, color=(0, 255, 255))

            # class 0 car detected
            elif int(box.cls.item()) == 0:
                #get the center of the vehicle
                vehicle_center = get_center(box.xyxy)
                is_violating, violation_type = is_overtaking(vehicle_center, line_center, width)
                cv2.circle(frame, vehicle_center, 10, (0, 255, 0), -1)
                
                #check if the vehicle is overtaking
                if is_violating and line_center != (1, 1):
                    #draw red bounding box on the violating vehicle
                    draw_bbox(frame, box, color=(0, 0, 255), thickness=5)
                    #write the violation detected text on the top left of the frame
                    cv2.putText(frame, "violation detected !", (20, int(height/2)), cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 0, 255), 2)

    except AttributeError as e:
        print(e)
        pass
    
    frame_placeholder.image(frame, channels="BGR", caption="Smart Street")
    
    out.write(frame)

#release the camera capture and video writer
cap.release()
out.release()
print(f"Time elapsed: {dt.datetime.now() - start}")