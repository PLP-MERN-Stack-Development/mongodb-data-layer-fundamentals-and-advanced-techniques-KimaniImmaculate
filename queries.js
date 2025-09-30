const {MongoClient} = require('mongodb');

//Connection URI
const uri = "mongodb://localhost:27017";
//Database and collection names
const dbName = "plp_bookstore";
const collectionName = "books";

//Function to connect to MongoDB and perform queries
async function runQueries() {
    const client = new MongoClient(uri);

    try {
        //Connect to the MongoDB server
        await client.connect();
        console.log('Connected to MongoDB server');

        //Get database and collection
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

// CRUD Operations
// 1. Find all books in a specific genre
const fictionBooks = await collection.find({ genre: "Fiction" }).toArray();
console.log('Fiction Books:', fictionBooks);

// 2. Find books published after a certain year
const recentBooks = await collection.find({ published_year: { $gt: 1940 } }).toArray();
console.log('Books published after 1940:', recentBooks);

// 3. Find books by a specific author
const toklienBooks = await collection.find({ author: "J.R.R. Tolkien" }).toArray();
console.log('Books by J.R.R. Tolkien:', toklienBooks);

// 4. Update the price of a specific book
const updateResult = await collection.updateOne(
    { title: 'Wuthering Heights' },
    { $set: { price: 5.99 } }
);
console.log(`Updated ${updateResult.modifiedCount} document(s)`);

// 5. Delete a book from the collection by title
const deleteResult = await collection.deleteOne({ title: 'Moby Dick' });
console.log(`Deleted ${deleteResult.deletedCount} document(s)`);

//Advanced Queries 
// 1. Find books that are in stock and published after 2010
const newInStock = await collection.find({ in_stock: true, published_year: { $gt: 2010 } }).toArray();
console.log('Books in stock and published after 2010:', newInStock);

// 2. Use Projection to return only title, author, price
const projectionBooks = await collection.find({}, { projection: { title: 1, author: 1, price: 1, _id: 0 } }).toArray();
console.log('Books with title, author, and price:', projectionBooks);

// 3. Sort books price in ascending order 
const priceAscending = await collection.find().sort({ price: 1 }).toArray();
console.log('Books sorted by price in ascending order:', priceAscending);

// 4. Sort books price in desending order
const priceDescending = await collection.find().sort({ price: -1 }).toArray();
console.log('Books sorted by price in descending order:', priceDescending);

// 5. Pagination: 5 books per page 
const page = 1; // Change this to get different pages
const pageSize = 5;
const paginatedBooks = await collection.find()
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .toArray();
console.log(`Page ${page} of books (5 per page):`, paginatedBooks);  

// Aggregation Pipeline
// 1. Average price of books in each genre
const avgPriceByGenre = await collection.aggregate([
    { $group: {
         _id: "$genre",
         averagePrice: { $avg: "$price" } } }
]).toArray();
console.log('Average price of books by genre:', avgPriceByGenre);

// 2. Author with the most books
const authorWithMostBooks = await collection.aggregate([
    { $group: {
         _id: "$author",
         bookCount: { $sum: 1 } 
      } 
    },
    { $sort: { bookCount: -1 } },
    { $limit: 1 }
]).toArray();
console.log('Author with the most books:', authorWithMostBooks);

// 3. Group books by decade
const booksByDecade = await collection.aggregate([
    { $group: {
         _id: { $concat: [
             { $toString: { $multiply: [ { $floor: { $divide: ["$published_year", 10] } }, 10 ] } },
             "s"
         ] },
         books: { $push: "$title" }
      } 
    },
    { $sort: { _id: 1 } }
]).toArray();
console.log('Books grouped by decade:', booksByDecade);

// Indexing
// 1. Create an index on title field
await collection.createIndex({ title: 1 });
console.log('Index created on title field');

// 2. Create a compound index on author and published_year
await collection.createIndex({ author: 1, published_year: -1 });
console.log('Compound index created on author and published_year fields');

// 3. Query with explain before/after creating indexes
const explainResult = await collection.find({ title: "Wuthering Heights" }).explain("executionStats");
console.log('Explain output for query on book title "Wuthering Heights:', explainResult);

} catch (err) {
    console.error(err);
  } finally {
    await client.close();
    console.log('\nConnection closed');
  }
}

runQueries().catch(console.error);