Pandaroma

It is a web based application which makes use of REST API.

Introduction: Pandaroma is a gallery for uploading photos of pandas via sending them to a specified mobile number along with a description.

index.html: It contains the frontend design of the web page. It use vue as a framework and asynchronously waits for the image to add it to the gallery

incoming-message: It is used to send a message back to the user to confirm that the message has been recieved.

api/pandaaa: it is the backend. Here we take the message recieved and divide it into tokens to be given to the frontend to be displayed as well as their respective description.

Strict schema: The strict schema has the following rules:

1. the source should always start with "https://" and should be of type string
2. the message should contain a description
3. the alt should not be empty
4. only image format should be allowed (i.e. no videos or audios)
5. Return the number of images successfully added and the ones not added


API contract: 


Endpoint:  GET /api/pandaaa

Produces:  application/json


Success Response (200):

  ok:    true
  
  data:  GalleryItem[]
  
  meta:
  
    total:   integer >= 0
    
    skipped: integer >= 0

GalleryItem:

  src:            string (HTTPS URL)
  
  description:    string
  
  alt:            string

Error Response (200 with ok: false):

  ok:    false
  
  data:  []
  
  error:
  
    code:    string (enum: TWILIO_ERROR | CONFIG_ERROR)
    
    message: string
    
  meta:
  
    total:   0
    
    skipped: 0
    


