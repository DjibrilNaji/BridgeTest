import * as fs from 'fs';
import superagent from 'superagent';

const pageLimit = 1;

(async () => {
    try {
        //  Authentification
        const resAuthent = await superagent.post('https://api.bridgeapi.io/v2/authenticate')
            .set('Bridge-Version', '2021-06-01')
            .set('Content-Type', 'application/json')
            .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
            .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
            .send({email: 'john.doe@email.com', password: 'password123'});


        // Recupérer le token
        const access_token = resAuthent._body.access_token;
        const expires_at = resAuthent._body.expires_at;


        // la liste des items bancaires avec leurs détails ;
        const resItemBank = await superagent.get('https://api.bridgeapi.io/v2/items?limit=' + pageLimit)
            .set('Bridge-Version', '2021-06-01')
            .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
            .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
            .set('Authorization', "Bearer " + access_token)

        // Recupérer l'item
        const objItemBank = resItemBank._body.resources;

        // la liste des transactions
        const resListTransac = await superagent.get('https://api.bridgeapi.io/v2/transactions?limit=' + pageLimit)
            .set('Bridge-Version', '2021-06-01')
            .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
            .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
            .set('Authorization', "Bearer " + access_token);

        // Récupérer les transactions
        const objListTransac = resListTransac._body.resources;

        // Toutes la situation bancaire
        const situation = {};

        // Ajout de l'access_token dans l'objet situation
        situation["access_token"] = {};
        situation["access_token"]["value"] = access_token;
        situation["access_token"]["expires_at"] = expires_at;

        // Ajout des items dans l'objet situation
        situation["items"] = objItemBank;

        // Ajout des transactions dans l'objet situation
        situation["transactions"] = objListTransac;

        // Récuperer le tableau items et ajouter un tableau accounts
        const itemObj = objItemBank;
        itemObj["accounts"] = [];


        // la liste des accounts liés à ces mêmes items ;
        const resListAccount = await superagent.get('https://api.bridgeapi.io/v2/accounts?item_id=' + objItemBank[0].id + '&limit=' + pageLimit)
            .set('Bridge-Version', '2021-06-01')
            .set('Client-Id', '945a08c761804ac1983536463fc4a7f6')
            .set('Client-Secret', 'YqUINh5B5pYlp7UzlENutajikoDX1gIW4pNObUCn9sEXLXGm39Mm1Yq8JKUFaHUD')
            .set('Authorization', "Bearer " + access_token);

        const objListAccount = resListAccount._body.resources;

        // Création de l'objet account pour ajouter tout les critères que l'on souhaite avoir
        const accountObj = {};

        accountObj["id"] = objListAccount[0].id;
        accountObj["name"] = objListAccount[0].name;
        accountObj["balance"] = objListAccount[0].balance;
        accountObj["status"] = objListAccount[0].status;
        accountObj["status_code_info"] = objListAccount[0].status_code_info;
        accountObj["status_code_description"] = objListAccount[0].status_code_description;
        accountObj["updated_at"] = objListAccount[0].updated_at;
        accountObj["type"] = objListAccount[0].type;
        accountObj["currency_code"] = objListAccount[0].currency_code;
        accountObj["iban"] = objListAccount[0].iban;

        itemObj["accounts"] = accountObj;

        // Save File
        var jsonData = JSON.stringify(situation);
        console.log(situation)

        fs.writeFile("situation.json", jsonData, "utf8", (err) => {
            if (err)
                console.log(err);
            else {
                console.log("Fichier enregistrer avec succès\n");
            }
        });
    } catch (err) {
        console.error(err);
    }
})();
