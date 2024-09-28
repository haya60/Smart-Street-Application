from pyicloud import PyiCloudService
from geopy.geocoders import Nominatim
import datetime

class DeviceLocator:
    def __init__(self, email, password):
        # Authentication
        self.api = PyiCloudService(email, password)
        self.geolocator = Nominatim(user_agent="my-unique-user-agent")

    def get_device(self, index):
        return self.api.devices[index]

    # retrieve the device’s last known location and time
    def device_location(self, device):
        # location
        location = device.location()
        latitude = location['latitude']
        longitude = location['longitude']

        r_location = self.geolocator.geocode(f"{latitude},{longitude}")
        address = r_location.address.split(',')
        street_name = address[0]
        neighborhood = address[1]
        city = address[4]
        postal_code = address[5]
        country = address[6]


        # time
        timestamp = location['timeStamp'] / 1000
        date_time = datetime.datetime.fromtimestamp(timestamp)
        date = date_time.date()
        date = date.strftime('%Y-%m-%d')
        time = date_time.time()
        time = time.strftime('%H:%M:%S')

        return street_name, neighborhood, city, postal_code, country, date, time, latitude, longitude


# # getting the location by icloud email
# locator = deviceLocator('dhom222666@gmail.com', 'Dd123321')
# device = locator.get_device(2)

# street_name, neighborhood, city, postal_code, country, date, time = locator.device_location(device)


