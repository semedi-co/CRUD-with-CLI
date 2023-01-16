const db = require("./database");
const readline = require("readline");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const clc = require("cli-color");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const start = () => {
  console.log(
    "#### Selamat Datang di Bank Digital ### \n",
    "1. Buka Rekening \n",
    "2. Setor Tunai \n",
    "3. Tarik Tunai \n",
    "4. Transfer \n",
    "5. Cek Saldo \n"
  );
  rl.question("Silahkan pilih menu : ", (pm) => {
    if (pm.trim() == 1) {
      Buka();
    } else if (pm.trim() == 2) {
      Setor();
    } else if (pm.trim() == 3) {
      Tarik();
    } else if (pm.trim() == 4) {
      Transfer();
    } else if (pm.trim() == 5) {
      CekSaldo();
    } else {
      console.log("Inputan yang anda masukkan salah !!!");
      start();
    }
  });
};

const Buka = () => {
  rl.question("Masukkan Nama Anda : ", (nm) => {
    if (nm.trim().length == 0) {
      console.log(clc.red("nama harus diisi !!!"));
      Buka();
    }
    rl.question("Masukkan Tanggal Lahir : ", (tgl) => {
      if (tgl.trim().length == 0) {
        console.log(clc.red("tanggal lahir harus diisi !!!"));
        Buka();
      }
      rl.question("Masukkan Alamat Anda : ", (almt) => {
        if (almt.trim().length == 0) {
          console.log(clc.red("alamat harus diisi !!!"));
          Buka();
        }
        rl.question("Masukkan Pin Untuk Rekening Anda : ", (pin) => {
          if (pin.trim().length == 0) {
            console.log(clc.red("pin tidak boleh kosong !!!"));
            Buka();
          } else if (pin.trim().length != 6) {
            console.log(clc.red("pin harus 6 digit"));
            Buka();
          } else {
            rl.question("Masukkan Saldo Awal: ", async (sld) => {
              if (sld.trim().length == 0) {
                console.log(clc.red("saldo harus diisi"));
                Buka();
              } else if (sld.trim() < 50000) {
                console.log(clc.red("saldo minimal Rp. 50.000"));
                Buka();
              } else {
                const i = crypto.randomUUID();
                await db("nasabah")
                  .insert({
                    id: i,
                    nama: nm,
                    tanggal_lahir: tgl,
                    alamat: almt,
                    no_rekening: crypto.randomInt(999999),
                    pin: bcrypt.hashSync(pin, 10),
                    saldo: sld,
                  })
                  .catch((err) => {
                    console.log(clc.red(err.message));
                    Buka();
                  });

                console.log(
                  clc.greenBright(
                    "Selamat anda berhasil mendaftar melalui aplikasi CLI PPDB :)"
                  )
                );
                get(i);
              }
            });
          }
        });
      });
    });
  });
};

const get = async (arr) => {
  const data = await db("nasabah").where({id: arr}).select(
    db.raw(
      "nama,DATE_FORMAT(tanggal_lahir, '%d-%m-%Y') AS tanggal_lahir, alamat, no_rekening, saldo"
    )
  );
  data.forEach((d) => {
    const sld = Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(d.saldo);
    console.log("Nama : " + d.nama);
    console.log("Tanggal Lahir : " + d.tanggal_lahir);
    console.log("Alamat : " + d.alamat);
    console.log("No. Rekening : " + d.no_rekening);
    console.log("Saldo : " + sld);
    console.log("\n");
  });

  start();
};

start();
