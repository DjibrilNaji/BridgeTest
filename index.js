import * as fs from 'fs';
import superagent from 'superagent';

const pageLimit = 500;

(async () => {
    try {
        //  Authentification
        const resAuthent = await superagent.post('https://api.bridgeapi.io/v2/authenticate')
            .set('Bridge-Version', '2021-06-01')
            .set('Content-Type', 'application/json')
            .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
            .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
            .send({email: 'john.doe@email.com', password: 'password123'});


        // De String à Object
        const objAuthent = JSON.parse(resAuthent);

        // la liste des items bancaires avec leurs détails ;
        const resItemBank = await superagent.get('https://api.bridgeapi.io/v2/items?limit=' + pageLimit)
            .set('Bridge-Version', '2021-06-01')
            .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
            .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
            .set('Authorization', objAuthent.access_token)

        // De String à Object
        const objItemBank = JSON.parse(resItemBank);

        // la liste des transactions
        const resListTransac = await superagent.get('https://api.bridgeapi.io/v2/transactions?limit=2')
            .set('Bridge-Version', '2021-06-01')
            .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
            .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
            .set('Authorization', objAuthent.access_token);

        // De String à Object
        const objListTransac = JSON.parse(resListTransac);

        // Toutes la situation bancaire
        var situation = {};

        // access_token
        situation["access_token"] = {};
        situation["access_token"]["value"] = objAuthent.access_token;
        situation["access_token"]["expires_at"] = objAuthent.expires_at;

        // items
        situation["items"] = [];

        for (let i = 0; i < objItemBank.resources.lenght; i++) {
            var itemObj = objItemBank.resources[i];
            itemObj["accounts"] = [];

            // la liste des accounts liés à ces mêmes items ;
            const resListAccount = await superagent.get('https://api.bridgeapi.io/v2/accounts?item_id=' + itemObj.item_id + '&limit=' + pageLimit)
                .set('Bridge-Version', '2021-06-01')
                .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
                .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
                .set('Authorization', objAuthent.access_token);

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
            // Push objet item 1 par 1
            situation["items"].push(itemObj);
        }

        // Transactions
        situation["transactions"] = objListTransac.resources;

        // Save File
        var jsonData = JSON.stringify(situation);

        fs.writeFile("test.txt", jsonData, function (err) {
            if (err) {
                console.log(err);
            }
        });

    } catch (err) {
        console.error(err);
    }
})();
