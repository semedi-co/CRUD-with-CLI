const db = require("./database");
const readline = require("readline");
const clc = require("cli-color");

// initialize readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const main = () => {
  console.log("### Selamat Datang di PPDB UNUJA Fakultas Teknik ###");
  console.log("1. Pendaftaran");
  console.log("2. Daftar Mahasiswa Terdaftar");
  rl.question("Silahkan pilih menu diatas : ", (answer) => {
    if (answer == 1) {
      registerPPDB();
    } else if (answer == 2) {
      getRegistered();
    } else {
      console.log(clc.red("Anda salah memasukkan inputan !!!"));
      main();
    }
  });
};

// menu register PPDB
const registerPPDB = () => {
  rl.question("Masukkan nama anda : ", (nama) => {
    if (nama.trim().length == 0) {
      console.log(clc.red("Nama harus diisi !!"));
      registerPPDB();
    } else {
      rl.question("Masukkan tanggal lahir : ", (tanggal_lahir) => {
        if (tanggal_lahir.trim().length == 0) {
          console.log(clc.red("Tanggal lahir harus diisi !!"));
          registerPPDB();
        } else {
          rl.question(
            "Masukkan jenis kelamin anda [L/P] : ",
            (jenis_kelamin) => {
              if (jenis_kelamin.trim().length == 0) {
                console.log(clc.red("Jenis Kelamin harus diisi !!"));
                registerPPDB();
              } else {
                rl.question(
                  "Masukkan prodi yang anda mau [IF, SI, RPL, TI, TE] : ",
                  async (prodi) => {
                    if (prodi.trim().length == 0) {
                      console.log(clc.red("Prodi harus diisi !!!"));
                      registerPPDB();
                    } else {
                      await db("pendaftaran")
                        .insert({
                          nama,
                          nim: require("crypto").randomInt(9999999999),
                          tanggal_lahir,
                          jenis_kelamin,
                          prodi,
                        })
                        .catch((err) => {
                          console.log(clc.red(err.message));
                          registerPPDB();
                        });

                      console.log(
                        clc.greenBright(
                          "Selamat anda berhasil mendaftar melalui aplikasi CLI PPDB :)"
                        )
                      );
                      main();
                    }
                  }
                );
              }
            }
          );
        }
      });
    }
  });
};

// menu daftar mahasiswa
const getRegistered = async () => {
  const data = await db("pendaftaran").select(
    db.raw(
      "nama, nim, prodi, DATE_FORMAT(tanggal_lahir, '%d-%m-%Y') AS tanggal_lahir"
    )
  );

  data.forEach((d) => {
    console.log("Nama : " + d.nama);
    console.log("NIM  : " + d.nim);
    console.log("Tanggal Lahir : " + d.tanggal_lahir);
    console.log("Prodi : " + d.prodi);
    console.log("\n");
  });

  main();
};

// call main function
main();
