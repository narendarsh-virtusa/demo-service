var express = require('express');
var morgan = require('morgan');
var models = require('express-cassandra');
var faker = require('faker');
var cors = require('cors')
var corsOptions = {
  origin: 'http://localhost:9000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var cassandraHost = process.env.CASSANDRA_HOST || '127.0.0.1';
console.log('cassandraHost:', cassandraHost);

var debug = require('debug')('http')
  , name = 'Lloyds POC';


var app = express();
models.setDirectory(__dirname + '/models').bind({
  clientOptions: {
    contactPoints: [cassandraHost.toString()],
    protocolOptions: {
      port: 9042
    },
    keyspace: 'mykeyspace',
    queryOptions: {
      consistency: models.consistencies.one
    }
  },
  ormOptions: {
    defaultReplicationStrategy: {
      class: 'SimpleStrategy',
      replication_factor: 1
    },
    migration: 'safe'
  }
},
  function (err) {
    if (err) throw err;
  }
);

debug('booting %o', name);

setTimeout(function () {

  const products = ['Work Plan Pension', 'Pension Plan', 'Scottish Widow Pension', 'LBG Prime']
  let start = new Date();
  const totalCustomers = 1000;
  let duration;
  let count = 0;
  for (var i = 1; i <= totalCustomers; i++) {
    let e = {
      id: i,
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      age: Math.floor(Math.random() * 40) + 60,
      country: 'United Kindom',
      productValue: Math.floor(Math.random() * 5000000) + 2000000,
      productName: products[Math.floor(Math.random() * products.length - 1) + 1],
      productStartDate: "5 April 2018",
      regularContribution: "£150 per month",
      latestContribution: "£150 on 1 May"
    }
    let customer = new models.instance.Customer(e);
    duration = new Date().getTime() - start.getTime();

    customer.saveAsync()
    .then(()=> {
      count++;
      if(count == totalCustomers){
        debug(totalCustomers + ' customers in ' + duration + ' ms')
      }
    })
    .catch((err) => {
        console.log(err);
    });
  }

 



}, 1000);

