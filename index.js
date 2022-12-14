//Imports
const express = require('express')
const fs = require("fs")
const expressGraphQL = require('express-graphql').graphqlHTTP
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const qr = require("qrcode");
const jwt = require ("jwt-simple")

//Local Imports
const Login = require('./model/login')


//graphql
var schema = require('./graphql/userScehema');

const app = express()
app.use('/', express.static(path.join(__dirname, 'dist'))) //Connecting frontend Angular build folder

app.use(bodyParser.json())

const { 
    MongoClient,
    ObjectId
} = require("mongodb")



async function connectMongo(){
    
    const uri = "mongodb+srv://nishaj1234:nishaj1234@cluster0.wpfzffc.mongodb.net/mgmt_db?retryWrites=true&w=majority"
    mongoose.set('strictQuery', true);
    mongoose.connect(uri, ()=>{
        console.log("Connected to DB")
    })
    
    // const client = new MongoClient(uri);
 
    // try {
    // // Connect to the MongoDB cluster
    //     await client.connect();

    // // Make the appropriate DB calls
    //     await  listCollections(client);
        

    // } catch (e) {
    //     console.error(e);
    // }

    // async function listCollections(client){
    //     collectionList = await client.db().admin().listCollections();
 
    //     console.log("Databases:");
    //     collectionList.listCollections.forEach(db => console.log(` - ${db.name}`));
    // };

}

const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
  } = require('graphql')

//GraphQL schemas
const reservationType = new GraphQLObjectType({
  name: 'Reservation',
  fields:() => ({
      registrationId: {
          type: GraphQLNonNull(GraphQLString)
      },
      eventName: {
          type: GraphQLString
      },
      adminId: {
          type: GraphQLInt
      },
      location: {
          type: GraphQLString
      },
      start_time: {
          type: GraphQLString
      },
      eventCategory: {
          type: GraphQLString
      }
  })
});




const eventType = new GraphQLObjectType({
  name: 'Event',
  description: 'This shows the events',
  fields: () => ({
      id: { type: GraphQLNonNull(GraphQLInt) },
      name: { type: GraphQLNonNull(GraphQLString) },
      location: { type: GraphQLNonNull(GraphQLString) },
      date: { type: GraphQLNonNull(GraphQLString) }, 
      start_time: {type: GraphQLNonNull(GraphQLString) },
      end_time: { type: GraphQLString },
      category: {type: GraphQLNonNull(GraphQLString) },
      about: {type: GraphQLString },
      adminId: { type: GraphQLNonNull(GraphQLInt) }, 
      registeredUsers: {
          type: new GraphQLList(GraphQLInt)
      }
  })
})

//User Type
const userType = new GraphQLObjectType({
  name: 'User',
  description: 'This shows all users (admins and non-admins)',
  fields: () => ({
      id: { type: GraphQLNonNull(GraphQLInt) },
      name: { type: GraphQLNonNull(GraphQLString) },
      username: { type: GraphQLNonNull(GraphQLString) },
      password: { type: GraphQLNonNull(GraphQLString) },
      gender: { type: GraphQLNonNull(GraphQLString) },
      degree: { type: GraphQLNonNull(GraphQLString) },
      school: { type: GraphQLString },
      age: { type: GraphQLInt },
      email: { type: GraphQLNonNull(GraphQLString) },
      isAdmin: { type: GraphQLNonNull(GraphQLBoolean) },
      registeredEvts: {
          type: new GraphQLList(GraphQLInt),
      }
  })
}) 

// Query
const RootQueryType = new GraphQLObjectType({
  name: 'Query',
  description: 'Query for GET operation',
  fields: () => ({
      reservations:{
          type: new GraphQLList(reservationType),
          resolve: () => {
              const reservation = ReservationModel.find({})

              if(!reservation){
                  throw new Error('Error')
              }
              return reservations;
          }
      },
      reservation:{
          type: reservationType,
          args: {
              id: { type: GraphQLString }
          },
          resolve: async(parent, args) => {
              const reservationDetails = await ReservationModel.findOne({reservationId: id})
              if(!reservationDetails){
                  throw new Error('Error')
              }
              return reservationDetails;
          }
      },
      event_qloc:{
          type: new GraphQLList(eventType),
          args: {
              loc: { type: GraphQLString },
          },
          resolve: async(parent, args) => {
              return events.filter((event) => event.location === args.loc)
          }
      },
      event_qtype:{
          type: new GraphQLList(eventType),
          args: {
              category: { type: GraphQLString },
          },
          resolve: async(parent, args) => {
              return events.filter((event) => event.category === args.category)
          }
      },
      event_qid:{
          type: new GraphQLList(eventType),
          args: {
              id: { type: GraphQLInt },
          },
          resolve: async(parent, args) => {
              return events.filter((event) => event.adminId === args.id)
          }
      },
      event_qloctype:{
          type: new GraphQLList(eventType),
          args: {
              loc: { type: GraphQLString },
              category: { type: GraphQLString },
          },
          resolve: async(parent, args) => {
              return events.filter((event) => event.location === args.loc && event.category === args.category)
          }
      },
      event_qlocid:{
          type: new GraphQLList(eventType),
          args: {
              loc: { type: GraphQLString },
              id: { type: GraphQLInt },
          },
          resolve: async(parent, args) => {
              return events.filter((event) => event.location === args.loc && event.adminId === args.id)
          }
      },
      event_qtypeid:{
          type: new GraphQLList(eventType),
          args: {
              category: { type: GraphQLString },
              id: { type: GraphQLInt },
          },
          resolve: async(parent, args) => {
              return events.filter((event) => event.category === args.category && event.adminId === args.id)
          }
      },
      event_qloctypeid:{
          type: new GraphQLList(eventType),
          args: {
              loc: { type: GraphQLString },
              category: { type: GraphQLString },
              id: { type: GraphQLInt },
          },
          resolve: async(parent, args) => {
              
              return EventModel.find({location: args.loc, category: args.category, adminId: args.id})
          }
      },
      user:{
          type: userType,
          args: {
              username: { type: GraphQLString },
          },
          resolve: async(parent, args) => {
              return UserModel.find({username: args.username})
              //return users.find((user) => user.username === args.username)
          }
      }
  }) 
})      
      
//Mutation
const RootMutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: () => ({
      addEvent: {
          type: eventType,
          args: {
              name: { type: GraphQLString },
              location: { type: GraphQLString},
              date: {type: GraphQLString },
              start_time: { type: GraphQLString},
              end_time: { type: GraphQLString },
              available_seats: { type: GraphQLInt },
              category: { type: GraphQLString },
              about: { type: GraphQLString },
              adminId: { type: GraphQLInt },
          },
          resolve: (parent, args) => {
              const eventModel = new EventModel(args)
              const newEvent = eventModel.save();
              if (!newEvent) {
                  throw new Error('Error');
              }
              return newEvent
          }
      },
      addUser: {
          type: userType,
          args: {
              name: { type: GraphQLString },
              username: { type: GraphQLString},
              password: {type: GraphQLString },
              gender: { type: GraphQLString},
              degree: { type: GraphQLString },
              school: { type: GraphQLString },
              age: { type: GraphQLInt },
              email: { type: GraphQLString },
              isAdmin: { type: GraphQLBoolean },
          },
          resolve: (parent, args) => {
              const userModel = new UserModel(args)
              const newUser = userModel.save();
              if (!newUser) {
                  throw new Error('Error');
              }
              return newUser
          }
      }
  })
})


// Temporary Database
// const admins = [
// 	{ id: 1, name: 'AIS' },
// 	{ id: 2, name: 'GSG' },
// 	{ id: 3, name: 'VGSA' }
// ]

// const events = [
// 	{ id: 1, name: 'Holi', adminId: 1 },
// 	{ id: 2, name: 'Diwali', adminId: 1 },
// 	{ id: 3, name: 'Garba', adminId: 1 },
// 	{ id: 4, name: 'GSG Summit', adminId: 2 },
// 	{ id: 5, name: 'GSG Alumni Meet', adminId: 2 },
// 	{ id: 6, name: 'General Body Meeting', adminId: 2 },
// 	{ id: 7, name: 'VGSA Fall Ball', adminId: 3 },
// 	{ id: 8, name: 'Internship Info Session', adminId: 3 }
// ]


// //GraphQL schemas
// const EventType = new GraphQLObjectType({
//     name: 'Event',
//     description: 'This shows the events',
//     fields: () => ({
//         id: { type: GraphQLNonNull(GraphQLInt) },
//         name: { type: GraphQLNonNull(GraphQLString) },
//         adminId: { type: GraphQLNonNull(GraphQLInt) },
//         admin: {
//         type: AdminType,
//         resolve: (event) => {
//             return admins.find(admin => admin.id === event.adminId)
//         }
//         }
//     })
// })

// const AdminType = new GraphQLObjectType({
//     name: 'Admins',
//     description: 'This shows admins',
//     fields: () => ({
//         id: { type: GraphQLNonNull(GraphQLInt) },
//         name: { type: GraphQLNonNull(GraphQLString) },
//         events: {
//         type: new GraphQLList(EventType),
//         resolve: (admin) => {
//             return events.filter(event => event.adminId === admin.id)
//         }
//         }
//     })
// })

// // GraphQL Queries & Mutations

// // Query
// const RootQueryType = new GraphQLObjectType({
//     name: 'Query',
//     description: 'Query for GET operation',
//     fields: () => ({
//         event: {
//         type: EventType,
//         description: 'A Single Event',
//         args: {
//             id: { type: GraphQLInt }
//         },
//         resolve: (parent, args) => events.find(event => event.id === args.id)
//         },
//         events: {
//         type: new GraphQLList(EventType),
//         description: 'List of All events',
//         resolve: () => events
//         },
//         admins: {
//         type: new GraphQLList(AdminType),
//         description: 'List of All admins',
//         resolve: () => admins
//         },
//         admin: {
//         type: AdminType,
//         description: 'A Single Author',
//         args: {
//             id: { type: GraphQLInt }
//         },
//         resolve: (parent, args) => admins.find(admin => admin.id === args.id)
//         }
//     })
// })

// //Mutation
// const RootMutationType = new GraphQLObjectType({
//     name: 'Mutation',
//     description: 'Root Mutation',
//     fields: () => ({
//         addEvent: {
//         type: EventType,
//         description: 'Add an event',
//         args: {
//             name: { type: GraphQLNonNull(GraphQLString) },
//             adminId: { type: GraphQLNonNull(GraphQLInt) }
//         },
//         resolve: (parent, args) => {
//             const event = { id: events.length + 1, name: args.name, adminId: args.adminId }
//             events.push(event)
//             return event
//         }
//         },
//         addAuthor: {
//         type: AdminType,
//         description: 'Add an admin',
//         args: {
//             name: { type: GraphQLNonNull(GraphQLString) }
//         },
//         resolve: (parent, args) => {
//             const admin = { id: admins.length + 1, name: args.name }
//             admins.push(admin)
//             return admin
//         }
//         }
//     })
// })

// //Delaration of Query and Mutations

// const schema = new GraphQLSchema({
//     query: RootQueryType,
//     mutation: RootMutationType
// })


//Endpoints
app.use('/graphql', expressGraphQL({    // using graphql interface for time being to test, pls change this later
    schema: schema,
    graphiql: true,
    
}))



// Reugular RESTful Calls for login authentication
app.post('/api/change-password', async (req, res) => {
	const { token, newpassword: plainTextPassword } = req.body
	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	try {
		const user = jwt.verify(token, JWT_SECRET)

		const _id = user.id

		const password = await bcrypt.hash(plainTextPassword, 10)

		await User.updateOne(
			{ _id },
			{
				$set: { password }
			}
		)
		res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: ';))' })
	}
})

app.post('/api/login', async (req, res) => {
	const { username, password } = req.body
	const user = await User.findOne({ username }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid username/password' })
	}

	if (await bcrypt.compare(password, user.password)) {

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
})

app.post('/api/register', async (req, res) => {
	const { username, password: plainTextPassword } = req.body

	if (!username || typeof username !== 'string') {
		return res.json({ status: 'error', error: 'Invalid username' })
	}

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		const response = await User.create({
			username,
			password
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
	}

	res.json({ status: 'ok' })
})


app.get('/', function(req, res){
    console.log("svhjvs")
    res.send({ title: 'GeeksforGeeks' });
});

//Start a server
connectMongo()
app.listen(3000, () => console.log('Started server at 3000'))
