# AthleticFacilitiesBookingWebApp
Instructions on how to run the web-app:

Step 1: We open command promt(cmd) and navigate to the path of our project. The path of our current project is: C:\web-app-dev\athletic_facilities_booking. So we write on cmd the command: cd C:\web-app-dev\athletic_facilities_booking

  <img width="675" height="197" alt="image" src="https://github.com/user-attachments/assets/d6de4996-bd1f-430c-b99c-4b5c163eb278" />                                              

Step 2: Then we run the server file we created in our project with command: node server.js and what happens is the server is running on port:3000 as we defined it and our MongoDB database is connected as well.

  <img width="641" height="87" alt="image" src="https://github.com/user-attachments/assets/5bf59b16-67cc-4255-9df4-18686e0c03fe" />

Then we go to the browser and type the URL: http://localhost:3000 which redirects us to the frontend/login.html page:

  <img width="541" height="781" alt="image" src="https://github.com/user-attachments/assets/7d64d35e-f8c2-4e05-b249-34636e836fe6" />

The previous screenshot shows a simple login form in which the user can enter its credentials and login to our main frontend/index.html webpage. What we will describe below is the capabilities of our app. More specifically we will analyze the steps on how the user can login to the main page, make an online reservation to one of the available facilities and how this reservation is stored correctly to our database. First of all we run the server as mentioned in the previous steps 1-2. Then we register the user by clicking on the field:

  <img width="234" height="28" alt="image" src="https://github.com/user-attachments/assets/3255017c-3d30-46d1-a77c-5e65af324050" />

Then we get redirected to the frontend/register.html page as it is shown below, enter the credentials of a user and click on the button "Εγγραφή": 

  <img width="978" height="532" alt="image" src="https://github.com/user-attachments/assets/3f247283-bf4b-4c52-be22-06b5fd878b44" />

Then the credentials of the previous user are stored on our MongoDB Atlas database in the users field:

  <img width="996" height="225" alt="image" src="https://github.com/user-attachments/assets/ef34040f-6b0b-4383-b2d5-5f7a061a15df" />

Then we click on the field: 

  <img width="290" height="28" alt="image" src="https://github.com/user-attachments/assets/6b3fc5b5-8d6a-4627-a60f-e3d1ce6f891e" />

and we return to the login page. We use the previous credentials and we click on the button "Σύνδεση" to login: 

  <img width="534" height="776" alt="image" src="https://github.com/user-attachments/assets/93adda6c-ea4c-4eee-9bf9-ac86efd771c7" />

Ther localhost:3000 server confirms it with the message:

  <img width="626" height="168" alt="image" src="https://github.com/user-attachments/assets/fea81d48-e647-4995-9dd0-aa2c1aa4c8f8" />

And we finally login to our main frontend/index.html page which is shown below:

  <img width="1138" height="873" alt="image" src="https://github.com/user-attachments/assets/c7c28dab-0f96-40fe-988a-cd15f1d6c27f" /> 

We are going to expain what our frontend/index.html file includes step by step. First of all at the top there is a menu with a dropdown box which makes the whole frontend a bit more presentable and provides some options.

  <img width="1898" height="255" alt="image" src="https://github.com/user-attachments/assets/f108ceb5-a47b-440f-8c49-426838bdd15c" />

The user can hover or click on the different existing buttons. The field named "Ο Λογαριασμός μου" has the following buttons:

<p align="center"><img width="184" height="486" alt="image" src="https://github.com/user-attachments/assets/b597b699-cddc-4489-ab74-9260da2d2bdd" /></p>

By clicking on the Dashboard field we can observe the existing reservations of the logged in user. 

<p align="center"><img width="1000" height="275" alt="image" src="https://github.com/user-attachments/assets/0e563810-575b-418c-959e-6a8bd34c7bab" /></p>

These reservations are saved as well on our database on the field reservations: 

<p align="center">
  <img width="420" height="159" alt="image" src="https://github.com/user-attachments/assets/2dbf42d3-065e-49d9-a5c5-8f65b7ea7c20" />
  <img width="396" height="173" alt="image" src="https://github.com/user-attachments/assets/d01cc520-6f81-4339-bb4e-fd0774cdf1da" />
</p>
