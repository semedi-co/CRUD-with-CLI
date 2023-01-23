const db = require("./database");
const readline = require("readline");
const clc = require("cli-color");
const bcrypt = require("bcrypt");

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
  rl.question("\n Silahkan pilih menu : ", (answer) => {
    if (answer == 1) {
      rekening();
    } else if (answer == 2) {
      setor();
    } else if (answer == 3) {
      tarik();
    } else if (answer == 4) {
      transfer();
    } else if (answer == 5) {
      cek();
    } else {
      console.log(clc.red("Anda salah memasukkan inputan !!!"));
      main();
    }
  });
};

// menu Buka Rekening
const rekening = () => {
  rl.question("Masukkan nama anda : ", (nama) => {
    if (nama.trim().length == 0) {
      console.log(clc.red("Nama harus diisi !!"));
      rekening();
    } else {
      rl.question("Masukkan tanggal lahir anda : ", (tanggal_lahir) => {
        if (tanggal_lahir.trim().length == 0) {
          console.log(clc.red("Tanggal lahir harus diisi !!"));
          rekening();
        } else {
          rl.question("Masukkan alamat anda : ", (alamat) => {
            if (alamat.trim().length == 0) {
              console.log(clc.red("alamat harus diisi !!"));
              rekening();
            } else {
              rl.question("Masukkan PIN untuk rekening anda : ", (pin) => {
                if (pin.trim().length == 0) {
                  console.log(clc.red("PIN harus diisi !!"));
                  rekening();
                } else if (pin.trim().length != 6) {
                  console.log(clc.red("panjang PIN harus 6 digit"));
                  rekening();
                } else {
                  rl.question("Masukkan saldo awal : ", async (saldo) => {
                    if (saldo.trim() == 0) {
                      console.log(clc.red("Saldo harus diisi !!"));
                      rekening();
                    } else if (+saldo < 50000) {
                      console.log(clc.red("Saldo awal minimal Rp. 50.000"));
                      rekening();
                    } else {
                      no_rekening = require("crypto").randomInt(999999);
                      await db("nasabah")
                        .insert({
                          id: require("crypto").randomUUID(),
                          nama,
                          tanggal_lahir,
                          alamat,
                          no_rekening,
                          pin: bcrypt.hashSync(pin.trim(), 10),
                          saldo: +saldo,
                        })
                        .catch((err) => {
                          console.log(clc.red(err.message));
                          rekening();
                        });

                      console.log(
                        clc.greenBright(
                          "\n Selamat pembukaan rekening berhasil :) \n "
                        )
                      );
                      console.log("Nama : " + nama);
                      console.log("Tanggal lahir : " + tanggal_lahir);
                      console.log("Alamat : " + alamat);
                      console.log("No. Rekening : " + no_rekening);
                      console.log("Saldo : " + +saldo);
                      console.log("\n");
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

// menu Setor Tunai
const setor = () => {
  rl.question("Masukkan No. Rekening anda : ", async (no_rekening) => {
    if (no_rekening.trim().length == 0) {
      console.log(clc.red("No. Rekening harus diisi !!!"));
      setor();
    }

    const data = await db("nasabah").where({ no_rekening }).first();
    if (!data) {
      console.log(clc.red("No. Rekening belum terdaftar !!"));
      setor();
    } else if (data.status == "diblokir") {
      console.log(clc.red("No. Rekening anda diblokir"));
      start();
    } else {
      let wrong = 0;
      const inputPIN = (no_rekening, hashPIN) => {
        rl.question("Masukkan Pin Anda : ", async (pin) => {
          if (pin.trim().length == 0) {
            console.log(clc.red("PIN harus diisi !!!"));
            wrong += 1;
            inputPIN(no_rekening, hashPIN);
          } else if (!bcrypt.compareSync(pin, hashPIN)) {
            console.log(clc.red("PIN yang anda masukkan salah !!!"));
            wrong += 1;
            if (wrong < 3) {
              inputPIN(no_rekening, hashPIN);
            }
          } else {
            const jumlahSetor = () => {
              rl.question(
                "Masukkan uang yang mau disetor : ",
                async (jumlah) => {
                  if (+jumlah.trim().length == 0) {
                    console.log(clc.red("Jumlah uang setoran harus diisi !!!"));
                    jumlahSetor();
                  } else if (+jumlah < 50000) {
                    console.log(clc.red("Jumlah setor minimal Rp. 50.000"));
                    jumlahSetor();
                  } else if (+jumlah.trim() % 50000 != 0) {
                    console.log(
                      clc.red(
                        "Uang yang disetorkan harus pecahan Rp. 50.000 atau Rp. 100.000 !!!"
                      )
                    );
                    jumlahSetor();
                  } else {
                    await db("nasabah")
                      .where({ no_rekening })
                      .update({
                        saldo: data.saldo + +jumlah,
                      })
                      .catch((err) => {
                        console.log(clc.red(err.message));
                        main();
                      });

                    console.log(
                      clc.greenBright(
                        `Setor tunai berhasil, saldo anda saat ini ${new Intl.NumberFormat(
                          "id-ID",
                          { style: "currency", currency: "IDR" }
                        ).format(data.saldo + +jumlah)}`
                      )
                    );
                    main();
                  }
                }
              );
            };

            jumlahSetor();
          }

          if (wrong == 3) {
            await db("nasabah")
              .where({ no_rekening })
              .update({
                status: "diblokir",
              })
              .catch((err) => {
                console.log(clc.red(err.message));
              });

            console.log(
              clc.red(
                "Anda salah memasukkan PIN 3 kali, rekening anda terblokir !!!"
              )
            );
            main();
          }
        });
      };
      inputPIN(no_rekening, data.pin);
    }
  });
};

// menu Tarik Tunai
const tarik = () => {
  rl.question("Masukkan No. Rekening anda : ", async (no_rekening) => {
    if (no_rekening.trim().length == 0) {
      console.log(clc.red("No. Rekening harus diisi !!!"));
      tarik();
    }

    const data = await db("nasabah").where({ no_rekening }).first();
    if (!data) {
      console.log(clc.red("No. Rekening belum terdaftar !!"));
      tarik();
    } else if (data.status == "diblokir") {
      console.log(clc.red("No. Rekening anda diblokir"));
      main();
    } else {
      let wrong = 0;
      const inputPIN = (no_rekening, hashPIN) => {
        rl.question("Masukkan Pin Anda : ", async (pin) => {
          if (pin.trim().length == 0) {
            console.log(clc.red("PIN harus diisi !!!"));
            wrong += 1;
            inputPIN(no_rekening, hashPIN);
          } else if (!bcrypt.compareSync(pin, hashPIN)) {
            console.log(clc.red("PIN yang anda masukkan salah !!!"));
            wrong += 1;
            if (wrong < 3) {
              inputPIN(no_rekening, hashPIN);
            }
          } else {
            const pecahan = () => {
              console.log("### Pecahan Uang ###");
              console.log("1. Rp. 50.000");
              console.log("2. Rp. 100.000");
              rl.question(
                "\n Silahkan pilih pecahan yang mau anda tarik : ",
                async (pilihan) => {
                  if (pilihan.trim() == 0) {
                    console.log(clc.red("Salah masukkan inputan !!"));
                    pecahan();
                  } else if (pilihan.trim() == 1) {
                    const pilih1 = () => {
                      rl.question(
                        "Masukkan jumlah uang yang mau anda tarik : ",
                        async (jumlah) => {
                          if (+jumlah.trim().length == 0) {
                            console.log(clc.red("Jumlah uang harus diisi !!!"));
                            pilih1();
                          } else if (+jumlah.trim() % 50000 != 0) {
                            console.log(
                              clc.red(
                                "pecahan uang harus diisi kelipatan Rp. 50.000"
                              )
                            );
                            pilih1();
                          } else if (+jumlah.trim() > data.saldo) {
                            console.log(
                              clc.greenBright(
                                `Saldo rekening anda tidak mencukupi, sisa saldo anda ${new Intl.NumberFormat(
                                  "id-ID",
                                  { style: "currency", currency: "IDR" }
                                ).format(data.saldo)}`
                              )
                            );
                            pilih1();
                          } else {
                            await db("nasabah")
                              .where({ no_rekening })
                              .update({
                                saldo: data.saldo - +jumlah,
                              })
                              .catch((err) => {
                                console.log(clc.red(err.message));
                                main();
                              });

                            console.log(
                              clc.greenBright(
                                `Setor tunai berhasil, saldo anda saat ini ${new Intl.NumberFormat(
                                  "id-ID",
                                  { style: "currency", currency: "IDR" }
                                ).format(data.saldo - +jumlah)}`
                              )
                            );
                            main();
                          }
                        }
                      );
                    };
                    pilih1();
                  } else if (pilihan.trim() == 2) {
                    const pilih2 = () => {
                      rl.question(
                        "Masukkan jumlah uang yang mau anda tarik : ",
                        async (jumlah) => {
                          if (jumlah.trim().length == 0) {
                            console.log(clc.red("Jumlah uang harus diisi !!!"));
                            pilih2();
                          } else if (+jumlah.trim() % 100000 != 0) {
                            console.log(
                              clc.red(
                                "pecahan uang harus diisi kelipatan Rp. 100.000"
                              )
                            );
                            pilih2();
                          } else if (+jumlah.trim() > data.saldo) {
                            console.log(
                              clc.greenBright(
                                `Saldo rekening anda tidak mencukupi, sisa saldo anda ${new Intl.NumberFormat(
                                  "id-ID",
                                  { style: "currency", currency: "IDR" }
                                ).format(data.saldo)}`
                              )
                            );
                            pilih2();
                          } else {
                            await db("nasabah")
                              .where({ no_rekening })
                              .update({
                                saldo: data.saldo - +jumlah,
                              })
                              .catch((err) => {
                                console.log(clc.red(err.message));
                                main();
                              });

                            console.log(
                              clc.greenBright(
                                `Setor tunai berhasil, saldo anda saat ini ${new Intl.NumberFormat(
                                  "id-ID",
                                  { style: "currency", currency: "IDR" }
                                ).format(data.saldo - +jumlah)}`
                              )
                            );
                            main();
                          }
                        }
                      );
                    };
                    pilih2();
                  } else {
                    console.log(clc.red("Inputan anda salah !!"));
                    pecahan();
                  }
                }
              );
            };
            pecahan();
          }

          if (wrong == 3) {
            await db("nasabah")
              .where({ no_rekening })
              .update({
                status: "diblokir",
              })
              .catch((err) => {
                console.log(clc.red(err.message));
              });

            console.log(
              clc.red(
                "Anda salah memasukkan PIN 3 kali, rekening anda terblokir !!!"
              )
            );
            main();
          }
        });
      };
      inputPIN(no_rekening, data.pin);
    }
  });
};

// menu Transfer
const transfer = () => {
  rl.question("Masukkan No. Rekening anda : ", async (no_rekening) => {
    if (no_rekening.trim().length == 0) {
      console.log(clc.red("No. Rekening harus diisi !!!"));
      transfer();
    }

    const data = await db("nasabah").where({ no_rekening }).first();
    if (!data) {
      console.log(clc.red("No. Rekening belum terdaftar !!"));
      transfer();
    } else if (data.status == "diblokir") {
      console.log(clc.red("No. Rekening anda diblokir"));
      main();
    } else {
      let wrong = 0;
      const inputPIN = (no_rekening, hashPIN) => {
        rl.question("Masukkan Pin Anda : ", async (pin) => {
          if (pin.trim().length == 0) {
            console.log(clc.red("PIN harus diisi !!!"));
            wrong += 1;
            inputPIN(no_rekening, hashPIN);
          } else if (!bcrypt.compareSync(pin, hashPIN)) {
            console.log(clc.red("PIN yang anda masukkan salah !!!"));
            wrong += 1;
            if (wrong < 3) {
              inputPIN(no_rekening, hashPIN);
            }
          } else {
            const transfer = () => {
              rl.question(
                "Masukkan No. Rekening penerima : ",
                async (penerima) => {
                  const data = await db("nasabah")
                    .where({ no_rekening: penerima })
                    .first();
                  if (penerima.trim().length == 0) {
                    console.log(
                      clc.red("No. Rekening penerima tidak boleh kosong !!")
                    );
                    transfer();
                  } else if (!data) {
                    console.log(
                      clc.red(
                        "No. Rekening tidak terdaftar, Silahkan masukkan No.rekening yang ingin anda transfer !!"
                      )
                    );
                    transfer();
                  } else if (data.status == "blokir") {
                    console.log(
                      clc.red(
                        "Anda tidak dapat melakukan transfer, karena No. rekening di blokir !!"
                      )
                    );
                    main();
                  } else {
                    console.log(clc.greenBright("### Info Penerima ###"));
                    console.log("Nasabah ID     : " + data.id);
                    console.log("No. Rekening   : " + data.no_rekening);
                    console.log("Nama           : " + data.nama);
                    console.log("Alamat         : " + data.alamat);
                    const pertanyaan = () => {
                      rl.question(
                        "Apakah benar No. Rekening yang anda transfer [Y/N] : ",
                        (nanya) => {
                          if (nanya.trim().length == 0) {
                            console.log(
                              clc.red("Inputan tidak boleh kosong !!!")
                            );
                            pertanyaan();
                          } else if (
                            nanya.trim() == "N" ||
                            nanya.trim() == "n"
                          ) {
                            transfer();
                          } else if (
                            nanya.trim().toLowerCase() != "n" &&
                            nanya.trim().toLowerCase() != "y"
                          ) {
                            console.log(
                              clc.red(
                                "Inputan yang anda pilih tidak ada, Silahkan pilih kembali"
                              )
                            );
                            pertanyaan();
                          } else {
                            const jumlah = () => {
                              rl.question(
                                "Masukkan jumlah uang yang akan di Transfer : ",
                                async (uang) => {
                                  if (+uang.trim().length == 0) {
                                    console.log(
                                      clc.red("Inputan tidak boleh kosong")
                                    );
                                    jumlah();
                                  } else if (+uang.trim() > data.saldo) {
                                    console.log(
                                      clc.red(
                                        "Saldo anda tidak mencukupi untuk melakukan transfer !!!"
                                      )
                                    );
                                    main();
                                  } else if (uang < 10000) {
                                    console.log(
                                      clc.red("Transfer minimal Rp. 10.000")
                                    );
                                    jumlah();
                                  } else if (data.saldo < uang) {
                                    console.log(
                                      clc.red(
                                        "Saldo anda tidak mencukupi untuk melakukn transfer !!"
                                      )
                                    );
                                    main();
                                  } else {
                                    await db("nasabah")
                                      .where({ no_rekening })
                                      .update({
                                        saldo: data.saldo - +uang - 2500,
                                      })
                                      .catch(err => {
                                        console.log(err.message);
                                      });
                                    console.log(
                                      `Transfer berhasil, saldo anda saat ini  ${new Intl.NumberFormat(
                                        "id-ID",
                                        { style: "currency", currency: "IDR" }
                                      ).format(data.saldo - +uang - 2500)}`
                                    );
                                    main();
                                  }
                                }
                              );
                            };
                            jumlah();
                          }
                        }
                      );
                    };
                    pertanyaan();
                  }
                }
              );
            };
            transfer();
          }

          if (wrong == 3) {
            await db("nasabah")
              .where({ no_rekening })
              .update({
                status: "diblokir",
              })
              .catch((err) => {
                console.log(clc.red(err.message));
              });

            console.log(
              clc.red(
                "Anda salah memasukkan PIN 3 kali, rekening anda terblokir !!!"
              )
            );
            main();
          }
        });
      };
      inputPIN(no_rekening, data.pin);
    }
  });
};

const cek = () => {
  rl.question("Masukkan No. Rekening anda : ", async (no_rekening) => {
    const data = await db("nasabah").where({ no_rekening }).first();
    if (no_rekening.trim().length == 0) {
      console.log(clc.red("No. rekening tidak boleh kosong !!!"));
      cek();
    } else if (!data) {
      console.log(clc.red("No. Rekening belum terdaftar !!!"));
      cek();
    } else if (data.status == "blokir") {
      console.log(clc.red("No. rekening anda diblokir !!"));
      main();
    } else {
      let wrong = 0;
      const PIN = () => {
        rl.question("Masukkan PIN anda : ", async (pin) => {
          if (pin.trim().length == 0) {
            console.log(clc.red("PIN tidak boleh kososng !!"));
            wrong += 1;
            PIN();
          } else if (!bcrypt.compareSync(pin, data.pin)) {
            wrong += 1;
            if (wrong < 3) {
              console.log(clc.red("Password yang anda masukkan salah !!"));
              PIN();
            } else if (wrong == 3) {
              await db("nasabah")
                .where({ no_rekening })
                .update({ status: "blokir" });
              console.log(clc.red("No. rekening anda diblokir !!!"));
              main();
            }
          } else {
            console.log(
              clc.greenBright("Saldo anda saat ini : " + data.saldo)
            );
            main();
          }
        });
      };
      PIN();
    }
  });
};

// call main function
main();
