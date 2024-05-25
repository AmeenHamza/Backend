# Complete Backend

## .gitkeep File

* git only files ko track krta h lekin agr hamain koi empty folders push krne hote h to wo usko track nhi krta
* iske lye hm .gitkeep ki file banate h
* isse hota kuch nhi h bs ek file h jisse git us folder ko track krleta h

# Prettierrc

* For setting up prettier 
* Like code mein kitne tabes ka gap rakhna h semicolon lagana h ya nhi single quotes or double quotes use karne h ya nhi 

# Prettierignore

* Like gitignore 
* K kis kis file mein prettier use nhi krna h

# DB Connection

* Industry standard or zyada better approach yhi k iffe mein connect ka code likho.

# Caution!

* When you work with module.js in Backend be careful when import files because on importing it gives an error.
* The error of extension (.js, .etc)

# ApiError.js

* ye file errors ko better way mein handle karne k lye banai h take hamara code ek standard form mein hojaye.
* Means k hamain pata ho k hr api mein errors isi tarah se aainge jo hm define karainge or _response_ bhi.
* # How to do that?
* First of all ek class banayye usmein node.js ki builtin error ki class ko inherit karain phir apna custom constructor banain usmein jo errors, messages aapko chahiye wo define karain
### Super keyword

* jo cheez override krni hoti h use pass krte h (for inheritence)

# ApiResponse.js

* ApiResponse class step by step using a real-world example. The ApiResponse class is designed to standardize the responses sent from an API. It helps to ensure that all responses have a _consistent_ format.
* *_this.success = statusCode < 400_*: Sets the instance's success property to true if the status code is less than 400, otherwise false. This is because HTTP status codes below 400 generally indicate successful responses.

# mongoose-aggregate-paginate-v2

* This is used for tracking or optimizing large data for example how many pages a document have.
* Current page konsa h iske baad kitne page h isse pehle page h ya nhi 
* Per page per elements ki limit kitni rakhni h ise hi _Aggregation pipeline_ bhi bolte h

# mongoose _pre_ hook

* It's like a singup api when we encrypt a password.
* But in profession projects this is done in the model file.
* Pre hook basically do somework before data going to databse(mtlb k data age transfer hone se pehle koi krne kl lye like _encryption_)

## userSchema.pre("save", async function(next){})

* why we take function here instead of callback ?
* Because callback have no property of _this_ or yahan hamain ye indicate krna h k hamain userSchema ki properties mein se password per kuch function perform krna h or agr hamare pass this ka keyword nhi hoga to hm kese use indicate karainge.

# Methods in _mongoose_

* mongoose hamain boht si functionalities provide krta h jis mein se sab se important _methods_ h
* ab isse faida kia hoga k hm is mein apne custom methods create krsakte h jese hm user ko _login_ krne k lye alg se _API_ banate h usmein poora code likhte h or aese hi _signup_ k lye
* mongoose se faida kia hoga k hm _userModel_ mein hi ek method add krdainge

# Cloudinary (_For Uploading Files and Images_)

## How to upload an image/file on _Cloudinary_

* First copy the configuration code and form cloudinary website.
* And save all the secret variables or the name of cloud in environment file.
* Now copy the code of upload a file from the website and paste it on the cloud.js file which is present at utils folder.
* After that make a function that accepts a local file path.
* Ye local file path us file ka hoga jo user apne local system se upload karega cloudinary usko apne cloud mein store krke hamain url return krdega.
* Another important thing in upload function is the object which contains resource type like at which type of file user upload so I will set it to auto ab user jo bhi format mein file upload kre cludinary khud handle karlega.
* If you want to see further options from cloudinary go to the cloudinary website and see the more functions like crop the image and make it size customizable also further remove background and add some new background and also add some tags this features is awesome.

### Steps of handle uploading file.

* In professional projects or in a Big companies first the files of user temporarily on the server then send it to the cloud this increase the optimization.
* For handling file system we used 'fs' module and _Multer_.

## Handle Files using _Multer_

* Here we also use disk storage of multer because if we use the memory storage then if the user uploads large size file so it will be difficult for the application or server to manage so that is why I am using disk storage for handled files.

## How to write Industry standard Controllers ?

* Sabse pehle jo asynchandler ka method banaya tha usko call karo or usmein apne controllers likho.
* app.js mein apne routes ko import karwao jese hmne backend mein index.js mein kare the ismein app.js mein krrahe h (same hi bs thora sa difference h)
* routes k folder mein routes define honge as usual
* '/api/v1/users' just for defining versions at this time hm pehli dafa api banarahe h to v1 h future mein kabhi update krna hoga to v2 hojayega isse easy rehta h track krne mein or IS bhi h
* Yahan jo hm router.route likrahe h ye bhi same hi kaam krta h lekin hamain ek naya method seekhne ko mila h ab agr kahin aese bhi likha ho to hamain pata hoga k kis tarah se kaam hota h

#### if ([email, fullName, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
}

* ye sari fields ek sath check karega agr ek bhi field empty hogi to false return krdega

### Mongo DB $operators

* $or , $and (ye sare operators check karne k lye use hote h multiple conditions)

### select("-password -refreshToken")

* This will remove the following fields

### asynHandler() _Function_

* ye ek wrapper h try catch ko bar bar likhne se bchne k lye.
* jese hm simple controller banate the same usi tarah se h but hm hr controller mein alg se try catch ka block lagate the ab is ki wajah se hamain ye nhi lagana parega.
* Kyunke ye ek function return karraha h jo 3 argument leta h or usko as a promise treat karraha h to jo bhi error hoga ye khud hi handle karlega or hamain kuch krne ki zaroorat nhi paregi

## How to access model methods ?

* Jo bhi hm ne methods banaye h model mein wo sare methods User k variable mein nhi milainge jo hm ne export kia h
* isko access krne k lye jo bhi hm ne current user ka instance banaya hoga e.g: const user =  User.findOne({email}) 
* is user mein hamain wo sare methods milainge

# What is _refreshToken_ and _accessToken_

* _accessToken_ : It's similar to the token that we store in cookies with encrypted data of user the important point is that it has less expiry time as compared to refreshToken.
* _refreshToken_ : It's also similar to accessToken but it is store in Database also in cookies and it has more expiry time than accessToken.
* _How they works_ : as we discussed accesstoken has less expiry time like 15 min if the session expires user logout automatically for preventing the login again we used another end-point for user remain login 
* When accesstoken expires it send 401 res to the server after that refreshtoken work starts
* This end-point recieve the existing refreshtoken from user cookies or in the body.
* then it checks the refreshtoken which is provided by the user and the refresh token which is present in the database is equal or not.
* If yes it generates both new token and save into the cookies.
* This all the business logic is similar to _Login_ Functionaliy.

# To understand the _Subscription Schema_ watch video _18_

## Mongodb aggregation pipelines

* This topic is very tricky.
* It's similar to foreign key or primary key in MySQL but the method is different.
* Suppose we have two tables or models one is books and the other is authors.
* Obviously each book have an author so if we write all the details of author in every book table it will be difficult for the Database to manage.
* What we going to do.
* First we make a author table and add all the details of author in the table.
* Now each author have a unique _id so we used this _id in books table as an indicator like in author field we put author _id like 100 now go to the author table and get all the details of author.
* In the above discussion we done all the steps customizely but the simple and optimize method of doing the same thing is _Aggregation Pipeline_

### Pipelines

* Pipelines boht documents ki counting usko two different models se join krke count nikalna uska data nikalna easy krdeta h hamain fuzool ki queries bar bar chalane ki zaroorat nhi parti.
* 1- $match (for finding)
* 2- $lookup (for joining two tables or models e.g: left join, right join)

### How join two models

* First write _$lookup_ pipeline and give four parameters or properties.
* 1- _from_ : "Jis table se join krna ho uska name" (jese agr hm books k table mein h to authors ayega kyunke books mein autho_id ki field h uska data lane k lye)
* 2- _localfield_ : "abhi hm books k table mein h to yahan local field __author_id__ hogi"
* 3- _foreignfield_ : "yahan foriegn field wo (unique or primary key) hogi us table ki jisse join krrahe h yahan author k table ki unique identity ayegi *_id*"
* 4- _as_ : "Like a variable jis mein sara joining ka data store hoga"
* _$size_ : isko field ka name dena h jiska sum krna h or sath mein $bhi take ye pata rahe k ye field h

# For update API
 * Must use _Patch_ function