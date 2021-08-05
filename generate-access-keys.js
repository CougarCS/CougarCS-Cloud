const bcrypt = require('bcrypt');

let config = {
    'User': '',
    'Access Key ID': '',
    'Secret Access Key': ''
}

bcrypt.hash(config['Secret Access Key'], 10, (err, result) => {
    console.log(result)
    config['Secret Access Key Hash'] = result;

    for (const [key, value] of Object.entries(config)) {
        console.log(`${key}: ${value}`);
    }
});

