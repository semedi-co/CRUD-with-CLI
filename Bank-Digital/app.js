const db        = require("./database");
const readline  = require("readline");
const clc       = require("cli-color");
const bcrypt    = require("bcrypt")

// initialize readline 
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = () => {
  console.log("### Selamat Datang di Bank Digital ###");
  console.log("1. Buka Rekening");
  console.log("2. Setor Tunai");
  console.log("3. Tarik Tunai");
  console.log("4. Transfer");
  console.log("5. Cek Saldo");
  rl.question("\n Silahkan pilih menu : ", answer => {
    if (answer == 1) {
      rekening();
    } else if (answer == 2) {

    } else if (answer == 3) {

    } else if (answer == 4) {

    } else if (answer == 5) {

    } else {
      console.log(clc.red("Anda salah memasukkan inputan !!!"));
      main();
    }
  });
}

// menu Buka Rekening 
const rekening = () => {
  rl.question("Masukkan nama anda : ", nama => {
    if (nama.trim().length == 0) {
      console.log(clc.red("Nama harus diisi !!"));
      rekening();
    } else {
      rl.question("Masukkan tanggal lahir anda : ", tanggal_lahir => {
        if (tanggal_lahir.trim().length == 0) {
          console.log(clc.red("Tanggal lahir harus diisi !!"));
          rekening();
        } else {
          rl.question("Masukkan alamat anda : ", alamat => {
            if (alamat.trim().length == 0) {
              console.log(clc.red("alamat harus diisi !!"));
              rekening();
            } else {
              rl.question("Masukkan PIN untuk rekening anda : ", pin => {
                if (pin.trim().length == 0) {
                  console.log(clc.red("PIN harus diisi !!"));
                  rekening();
                } else if (pin.trim().length < 6 || pin.trim().length > 6) {
                  console.log(clc.red("panjang PIN harus 6 digit"));
                  rekening();
                } else {
                  rl.question("Masukkan saldo awal : ",async saldo => {
                    if (saldo == 0) {
                      console.log(clc.red("Saldo harus diisi !!"));
                      rekening();
                    } else if (saldo < 50000) {
                      console.log(clc.red("Saldo awal minimal Rp. 50.000"));
                      rekening();
                    } else {
                      await db("nasabah")
                        .insert({
                          id: require("crypto").randomUUID(),
                          nama,
                          tanggal_lahir,
                          alamat,
                          no_rekening: require("crypto").randomInt(999999),
                          pin: bcrypt.hashSync(pin, 10),
                          saldo: +saldo,
                        })
                        .catch(err => {
                          console.log(clc.red(err.message));
                          rekening();
                        });
                      
                      console.log(clc.greenBright("\n Selamat pembukaan rekening berhasil :) \n "));
                      
                      const data = await db("nasabah").select(db.raw("nama, DATE_FORMAT(tanggal_lahir, '%d-%m-%Y') AS tanggal_lahir, alamat, no_rekening, saldo "));
                        data.forEach((d) => {
                          console.log("Nama : " + d.nama);
                          console.log("Tanggal lahir : " + d.tanggal_lahir);
                          console.log("Alamat : " + d.alamat);
                          console.log("No. Rekening : " + d.no_rekening);
                          console.log("Saldo : " + d.saldo);
                          console.log("\n");
                        });
                        main();
                    } 
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};

// call main function 
main()