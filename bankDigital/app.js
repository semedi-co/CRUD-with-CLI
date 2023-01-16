const db = require("./database");
const readline = require("readline");
const clc = require("cli-color")
const bcrypt = require("bcrypt");
const crypto = require("crypto")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const main = () => {
    console.log("### Selamat Datang di Bank Digital ###");
    console.log("1. Buka Rekening");
    console.log("2. Setor Tunai");
    console.log("3. Tarik tunai");
    console.log("4. Transfer");
    console.log("5. Cek Saldo");
    rl.question("Silahkan Pilih Menu : " ,answer => {
        if (answer == 1) {
            registerBank()
            
        } else if (answer == 2) {
            
        }else if (answer == 3) {
            
        }else if (answer == 4) {
            
        }else if (answer == 5) {
            
        }else {
            console.log(clc.red("Anda salah memasukkan inputan"));
            main()
        }
    });
}; 

const registerBank = () => {
    rl.question("Masukkan nama Anda: ", nama => {
        if (nama.trim().length == 0) {
            console.log(clc.red("Nama harus di isi!!"));
            registerBank()
        }else {
            rl.question("masukkan tanggal lahir anda: ", tanggal_lahir => {
                if (tanggal_lahir.trim().length == 0) {
                    console.log(clc.red("tanggal lahir harus di isi!!"));
                    registerBank()
                }else {
                    rl.question("Masukkan Alamat Anda: ", alamat => {
                        if (alamat.trim().length == 0) {
                            console.log(clc.red("Alamat Harus di isi!!"));
                            registerBank()
                        }else {
                            rl.question("Masukkan Pin Anda: ", pin => {
                                if (pin.trim().length == 0) {
                                    console.log(clc.red("Pin harus di isi!!"));
                                    registerBank()
                                }else if (pin.trim().length != 6) {
                                    console.log(clc.red("Pin harus 6 digit"));
                                    registerBank()
                                }else {
                                    rl.question("Masukkan Saldo awal anda: ", async saldo => {
                                        if (saldo.trim().length == 0) {
                                            console.log(clc.red("Saldo harus di isi "));
                                            registerBank()
                                        }else if (saldo < 100000) {
                                            console.log(clc.red("saldo harus lebih / sama dengan",100000));
                                            registerBank()
                                        }else {
                                            const id = crypto.randomUUID()
                                            await db("nasabah")
                                                .insert({
                                                    id: id,
                                                    nama,
                                                    status: "aktif",
                                                    alamat,
                                                    tanggal_lahir,
                                                    no_rekening: require("crypto").randomInt(999999),
                                                    pin: bcrypt.hashSync(pin,6),
                                                    saldo
                                                })
                                                .catch(err => {
                                                    console.log(err.massage);
                                                    registerBank()
                                                })
                                                console.log(clc.greenBright("Selamat pembukaan rekening berhasil :) "));
                                                getRegisterBank(id)
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}
const getRegisterBank= async (get) => {
    const data= await db("nasabah").where({id:get}).select(db.raw("nama, alamat, saldo, pin,no_rekening,status,DATE_FORMAT(tanggal_lahir,'%d-%m-%Y') as tanggal_lahir"))

    data.forEach(e => {
        console.log("nama : " + e.nama);
        console.log("tanggal_lahir : " + e.tanggal_lahir);
        console.log("alamat : " + e.alamat);
        console.log("saldo : " + e.saldo);
        console.log("no_rekening : " + e.no_rekening);
        console.log("status : " + e.status);
        console.log("\n");
    });
    main()
}
main()