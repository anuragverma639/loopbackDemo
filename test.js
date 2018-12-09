let source = "rnRHyH5GdBfJS46VtnDHoa2VSUgykgAbn6"
let secret = "ssk8ZUffDDoA2jydpAJ2mCGEnSprQ"
let destination = "r35CkWkoLk22fr8oibnC15keP5DkqsU6Sm"

const RippleAPI = require("ripple-lib").RippleAPI;
const api = new RippleAPI({
	server: "wss://s.altnet.rippletest.net:51233"
});

let amount = "48"

const payment = {
    "source": {
        "address": source,
        "maxAmount": {
            "value": amount,
            "currency": "XRP"
        }
    },
    "destination": {
        "address": destination,
        "tag": Number(757422),
        "amount": {
            "value": amount,
            "currency": "XRP"
        }
    }
}


api.connect()
    .then(() => {
        //  console.log("1");
        return api.getAccountInfo(source)
    }).then(()=> {
        return api.preparePayment(source, payment)
    }).then(prepared => {
        return api.sign(prepared.txJSON, secret)
    }).then(result => {
        hash = result.id
        // console.log("5");
        return api.submit(result.signedTransaction)
    }).then(sub => {
        //  console.log("6");
        if (sub.resultCode == 'tesSUCCESS') {
            console.log(sub);
        }
    });

