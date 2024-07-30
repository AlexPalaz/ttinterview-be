# Technical Interview Project

## Backend

The backend of this project is built with Node.js using the Express.js framework. The database is powered by Firebase, ensuring a robust and scalable data storage solution.

## Install

- To run the project you should use a recent Node.js versione (20+).

- To install dependecies run:

```bash
npm install
```



### Run on your local

To launch the local cloud functions, use the following commands.:

```bash
# Start the authentication functions
npm run functions:auth

# Start the mock data functions
npm run functions:mocks

# Start the appointments functions
npm run functions:appointments

# Start the doctors functions
npm run functions:doctors
```

You should use a Terminal for each function. When you run a function, ensure that the port is not already in use.

Entry point: ```app.js```

##### Authentication

The authentication is structured through two main endpoints: /signup for registration and /signin for login.

The user can be registered as a patient or a doctor based on the Role passed in the request.

With the login is different. The endpoint will automatically understand if the user who is requesting the login is a Patient or a Doctor.

##### Validation

Done using express-validator to ensure the request body meets the required criteria.

##### Password Handling

bcrypt is used for hashing passwords securely and comparing hashed passwords during login.

##### Token Handling

```generateToken``` is a utility function to create tokens with JWT
```code
const generateToken = (data, expiresIn = "1h") =>
  jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
```

##### Error Handing

Each time we got an error we throw a response with the status and the error message.

```code
const generateResponse = (status = 500, message = []) => {
  if (message === undefined) {
    message = "Invalid message format";
  }

  return {
    status: status || 500,
    message,
  };
};
```

##### Database

Firestore is used as the database, with the db object handling interactions with collection.

Collections:

```
users
doctors
appointments
```

Document:

###### User
```
{
  createdAt: string;
  email: string;
  fullName: string;
  password: string;
  role: string;
  userId: string
} 
```

Note: Patients and Doctors are saved here, this entity is collecting only important informations related with the user. They are distinguished by role (PATIENT or DOCTOR)

###### Doctor
```
{
  availability: Availability[];
  avatar: string;
  email: string;
  experience: string;
  name: string;
  qualifications: string[];
  reviews: Review[];
  specialty: string;
  userId: string;
} 
```

Note: the userId is the same userId of User collection.

May you need that some informations like the email and the name are already declared inside the User document, however, these informations are registered also here because the Patient could need to get some doctor info like the email or the name. Essentially, this structure is exposing public infos to the Patient

###### Appointment
```
{
  appointmentId: Availability[];
  createdAt: string;
  date: string;
  doctorName: string;
  doctorUserId: string;
  patientName: string;
  patientUserId: string[];
  status: Status;
} 
```

## Mocks

I already prepared some mocks data and some mocks functions. These are better explained inside the frontend documentation. By the way, you can check the ```mock.js``` file to understand what can you do. Practically:

- You can add mock doctor data (like availability) passing the email of the doctor user
- You can add new doctors sending the request without passing a body
- You can create mock appointments passing doctorUserId and patientUserId









