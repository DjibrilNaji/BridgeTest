import * as fs from 'fs';
import superagent from 'superagent';

const pageLimit = 500;

function addAccessToken(access_token, expires_at) {
    // access_token
    var obj = {};
    obj["value"] = access_token;
    obj["expires_at"] = expires_at;

    return obj;
}

async function addItem(access_token) {
    // la liste des items bancaires avec leurs détails ;
    const resItemBank = await getItems(access_token);
    const objItemBank = JSON.parse(resItemBank);

    var listObj = [];

    for (let i = 0; i < objItemBank.resources.lenght; i++) {
        var itemObj = objItemBank.resources[i];
        itemObj["accounts"] = [];

        // la liste des accounts liés à ces mêmes items ;
        const resListAccount = await getAccount(access_token);
        const objListAccount = JSON.parse(resListAccount);

        for (let y = 0; y < objListAccount.resources.lenght; y++) {
            var account = objListAccount.resources[y];

            // console.log(account.id)

            var accountObj = {};
            accountObj["id"] = account.id;
            accountObj["name"] = account.name;
            accountObj["balance"] = account.balance;
            accountObj["status"] = account.status;
            accountObj["status_code_info"] = account.status_code_info;
            accountObj["status_code_description"] = account.status_code_description;
            accountObj["updated_at"] = account.updated_at;
            accountObj["type"] = account.type;
            accountObj["currency_code"] = account.currency_code;
            accountObj["iban"] = account.iban;

            itemObj["accounts"].push(accountObj);
        }
        listObj.push(itemObj);
    }
    return listObj;
}

async function addTransaction(access_token) {
    // Transactions
    const resListTransac = await getTransaction(access_token);
    const objListTransac = JSON.parse(resListTransac);
    return objListTransac.resources;

}

async function main() {
    try {
        //  Authent
        const resAuthent = await authentication();
        const objAuthent = JSON.parse(resAuthent);


        var situation = {};

        situation["access_token"] = addAccessToken(objAuthent.access_token, objAuthent.expires_at);

        // items
        situation["items"] = await addItem(objAuthent.access_token);


        situation["transactions"] = await addTransaction(access_token);

        // Save File
        const jsonData = JSON.stringify(situation);

        fs.writeFile("test.txt", jsonData, function (err) {
            if (err) {
                console.log(err);
            }
        });


    } catch (err) {
        console.error(err);
    }
};

async function getTransaction(access_token) {
    // la liste des transactions
    return superagent.get('https://api.bridgeapi.io/v2/transactions?limit=2')
        .set('Bridge-Version', '2021-06-01')
        .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
        .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
        .set('Authorization', access_token);

}

async function getItems(access_token) {
    return superagent.get('https://api.bridgeapi.io/v2/items?limit=' + pageLimit)
        .set('Bridge-Version', '2021-06-01')
        .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
        .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
        .set('Authorization', access_token);
}

async function authentication() {
    return superagent.post('https://api.bridgeapi.io/v2/authenticate')
        .set('Bridge-Version', '2021-06-01')
        .set('Content-Type', 'application/json')
        .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
        .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
        .send({email: 'john.doe@email.com', password: 'password123'});
}

async function getAccount(access_token,item_id) {
    return superagent.get('https://api.bridgeapi.io/v2/accounts?item_id=' + item_id + '&limit=' + pageLimit)
        .set('Bridge-Version', '2021-06-01')
        .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
        .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
        .set('Authorization', access_token);
}

main();