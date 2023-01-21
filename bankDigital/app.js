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
            setor()
        }else if (answer == 3) {
            tarik()
        }else if (answer == 4) {
            transfer()
        }else if (answer == 5) {
            ceksaldo()
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
                                        }else if (+saldo < 50000) {
                                            console.log(clc.red("saldo harus lebih / sama dengan",50000));
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
                                                    saldo: +saldo
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
const setor = () => {
    rl.question("Masukkan No. Rekening anda: " , async rekening => {
        if (rekening.trim().length == 0) {
            console.log(clc.red("No Rekening harus di isi"));
        }
        const no = await db("nasabah").where({no_rekening: rekening}).first()
        if (!no) {
            console.log(clc.red("No. Rekening belum terdaftar"));
            setor()
        }else if (no.status == "diblokir") {
            console.log(clc.red("No. Rekening ini tidak aktif/ di blokir"));
            main()
        }else {
            let e = 0;
            const inputPIN = (rekening, hashPIN) => {
                rl.question("Masukkan PIN anda: ", async pin => {
                    if (pin.trim().length == 0) {
                        console.log(clc.red("PIN harus di isi!!"));
                        e += 1
                        inputPIN(rekening,hashPIN);
                    }else if (!bcrypt.compareSync(pin, hashPIN)) {
                        console.log(clc.red("PIN yang anda masukkan salah!!"));
                        e += 1;;
                        if (e < 3) {
                           inputPIN(rekening, hashPIN) 
                        }
                    }else {
                        const jumlahtarik= () => {
                            rl.question("Masukkan uang yang mau anda setor: ", async jumlah => {
                                if (jumlah.trim().length == 0) {
                                    console.log(clc.red("Jumlah uang setoran hasrus diisi !!!"));
                                    jumlahtarik()
                                } else if (+jumlah < 50000) {
                                    console.log(clc.red("Jumlah setor minimal 50000"));
                                    jumlahtarik();
                                }else if (+jumlah.trim() % 50000 != 0) {
                                    console.log(clc.greenBright("Uang yang harus disetorkan harus pecahan Rp. 50.000,00 atau Rp 100.000,00 !!"));
                                    jumlahtarik()
                                }else {
                                    await db("nasabah")
                                        .where({ no_rekening: rekening})
                                        .update({
                                            saldo: no.saldo + +jumlah
                                        })
                                        .catch(err => {
                                            console.log(clc.red(err.massage));
                                            main()
                                        });
                                        console.log(clc.greenBright(`Setor tunai berhasil, saldo anda ${new Intl.NumberFormat('id-ID', { style: "currency", currency: "IDR" }).format(no.saldo+ +jumlah)}`));
                                        main();
                                };
                            });
                        };
                        jumlahtarik()
                    }

                    if (e == 3) {
                        await db("nasabah")
                        .where({ no_rekening: rekening})
                        .update({
                            status: "diblokir"
                        })
                        .catch(err => {
                            console.log(clc.red(err.message));
                        });
                        console.log(clc.red("Anda salah memasukkan PIN 3 kali, rekening anda di blokir !!"));
                        main()
                    }
                })
            }
            inputPIN(rekening, no.pin)
        }
    })
}
const tarik = () => {
    rl.question("Masukkan No rekning Anda: ", async no_rekening => {
        
            if (no_rekening.trim().length == 0) {
                console.log(clc.red("No Rekening harus di isi"));
            }
            const no = await db("nasabah").where({no_rekening}).first()
            if (!no) {
                console.log(clc.red("No. Rekening belum terdaftar"));
                tarik()
            }else if (no.status == "diblokir") {
                console.log(clc.red("No. Rekening ini tidak aktif/ di blokir"));
                main()
            }else {
                let e = 0;
                const inputPIN = (no_rekening, hashPIN) => {
                    rl.question("Masukkan PIN anda: ", async pin => {
                        if (pin.trim().length == 0) {
                            console.log(clc.red("PIN harus di isi!!"));
                            e+= 1
                            inputPIN(no_rekening,hashPIN);
                        }else if (!bcrypt.compareSync(pin, hashPIN)) {
                            console.log(clc.red("PIN yang anda masukkan salah!!"));
                            e+= 1
                            if (e < 3) {
                               inputPIN(no_rekening, hashPIN) 
                            }
                        }else {
                            const jumlahtarik= () => {
                                console.log("### Pecahan Uang ###");
                                console.log("1. Rp 50.000,00 ");
                                console.log("2. Rp 100.000,00");
                                rl.question("Silahkan pilih Pecahan uang yang ingin anda tarik: " , uang => {
                                        
                                        if (uang == 1) {
                                            rl.question("Masukkan jumlah uang yang ingin kamu tarik: ",async nominal => {
                                                if (+nominal.trim() == 0) {
                                                    console.log(clc.red("Uang harus diisi!!!"));
                                                    jumlahtarik()
                                                }
                                                else if (no.saldo < +nominal ) {
                                                    console.log(clc.red("Saldo anda tidak cukup !!!"));
                                                    jumlahtarik()
                                                }
                                                else if (+nominal < 50000) {
                                                    console.log(clc.red("Uang yang di tarik minimal Rp 50.000,00"));
                                                    jumlahtarik()
                                                
                                                }else if (+nominal.trim() % 50000 != 0) {
                                                    console.log(clc.red("Uang yang di tarik harus pecahan Rp 50.000,00 "));
                                                    jumlahtarik()
                                                }
                                                else {
                                                    
                                                    await db("nasabah")
                                                    .where({ no_rekening})
                                                    .update({
                                                        saldo: no.saldo - +nominal
                                                    })
                                                    .catch(err => {
                                                        console.log(clc.red(err.massage));
                                                        main()
                                                    });
                                                    console.log(clc.greenBright(`Tarik tunai berhasil, saldo anda ${new Intl.NumberFormat('id-ID', { style: "currency", currency: "IDR" }).format(no.saldo - +nominal)}`));
                                                    main();
                                                    
                                                }
                                            })
                                        }else if (uang == 2) {
                                            rl.question("Masukkan jumlah uang yang ingin kamu tarik: ",async nominal => {
                                                if (+nominal.trim() == 0) {
                                                    console.log(clc.red("Uang harus diisi!!!"));
                                                    jumlahtarik()
                                                }
                                                else if (no.saldo < +nominal ) {
                                                    console.log(clc.red("Saldo anda tidak cukup !!!"));
                                                    jumlahtarik()
                                                }
                                                else if (+nominal < 100000) {
                                                    console.log(clc.red("Uang yang di tarik minimal Rp 100.000,00"));
                                                    jumlahtarik()
                                                
                                                }else if (+nominal.trim() % 100000 != 0) {
                                                    console.log(clc.red("Uang yang di tarik harus pecahan Rp 100.000,00 "));
                                                    jumlahtarik()
                                                }
                                                else {
                                                    
                                                    await db("nasabah")
                                                    .where({ no_rekening})
                                                    .update({
                                                        saldo: no.saldo - +nominal
                                                    })
                                                    .catch(err => {
                                                        console.log(clc.red(err.massage));
                                                        main()
                                                    });
                                                    console.log(clc.greenBright(`Tarik tunai berhasil, saldo anda ${new Intl.NumberFormat('id-ID', { style: "currency", currency: "IDR" }).format(no.saldo - +nominal)}`));
                                                    main();
                                                    
                                                }
                                            })
                                            
                                        }else {
                                            console.log(clc.red("Anda salah memasukkan inputan !!!"));
                                        }
                                    })
                                
                            };
                            jumlahtarik()
                        }
    
                        if (e == 3) {
                            await db("nasabah")
                            .where({ no_rekening})
                            .update({
                                status: "diblokir"
                            })
                            .catch(err => {
                                console.log(clc.red(err.message));
                            });
                            console.log(clc.red("Anda salah memasukkan PIN 3 kali, rekening anda di blokir !!"));
                            main()
                        }
                    })
                }
                inputPIN(no_rekening, no.pin)
            }
        })
    
}
const transfer = () => {
    rl.question("masukkan No Rekening anda: " ,async no_rekening => {
        const data = await db("nasabah").where({no_rekening}).first()
        if (no_rekening.trim().length == 0 ) {
            console.log(clc.red("No Rekening harus di isi !!"));
            transfer()
        }else if (!data) {
            console.log(clc.red("No Rekening masih belum terdaftar!!!"));
            transfer()
        }else if (data.status == "diblokir") {
            console.log(clc.red("Anda tidak bisa melakukan transaksi karna rekening ini di blokir!!!"));
            main();
        }else {
            let e = 0;
            const inputPIN = (no_rekening, hashPIN) => {
                rl.question("Masukkan PIN anda: ", async pin => {
                    if (pin.trim().length == 0) {
                        console.log(clc.red("PIN harus di isi!!"));
                        e+= 1
                        inputPIN(no_rekening,hashPIN);
                    }else if (!bcrypt.compareSync(pin, hashPIN)) {
                        console.log(clc.red("PIN yang anda masukkan salah!!"));
                        e+= 1
                        if (e < 3) {
                           inputPIN(no_rekening, hashPIN) 
                        }
                    }else {
                        rl.question("Masukkan No rekening Penerima: ",async penerima => {
                            const pen= await db("nasabah").where({no_rekening: penerima}).first()
                            if (penerima.trim().length== 0) {
                                console.log(clc.red("No Rekening harus di isi!!"));
                                transfer()
                            }else if (!data) {
                                console.log(clc.red("No rekening tidak terdaftar!!!"));
                                transfer()
                            }else if (pen.status == "diblokir") {
                                console.log(clc.red("No rekening penerima tekah di blokir"));
                                transfer()
                            }else {
                                console.log("### info penerima");
                                console.log("Nasabah ID     : " + pen.id);
                                console.log("No Rekening    : " + pen.no_rekening);
                                console.log("Nama           : " + pen.nama);
                                console.log("Alamat         : " + pen.alamat);
                               rl.question("Apakah benar No Rekening yang ingin anda transfer[Y/N]: ", benar => {
                                if (benar.trim().toUpperCase() == "Y") {
                                    rl.question("masukkan jumlah uang yang ingin kamu transfer: " , async jumlah => {
                                        if (jumlah.trim().length == 0) {
                                            console.log(clc.red("Saldo harus di isi"));
                                            transfer()
                                        }else if (+jumlah > data.saldo) {
                                            console.log(clc.red("Saldo anda tidak cukup untuk melakukan transfer"));
                                            transfer()
                                        }else if (+jumlah < 10000) {
                                            console.log("Transfer minimal Rp. 10.000,00");
                                        }
                                        else {
                                            await db("nasabah")
                                                    .where({ no_rekening})
                                                    .update({
                                                        saldo: data.saldo - +jumlah - 2500
                                                    })
                                                    .catch(err => {
                                                        console.log(clc.red(err.massage));
                                                        main()
                                                    });
                                                    console.log(clc.greenBright(`Transfer berhasil, saldo anda ${new Intl.NumberFormat('id-ID', { style: "currency", currency: "IDR" }).format(data.saldo - +jumlah - 2500)}`));
                                                    main();
                                                    
                                        }
                                    }) 
                                }else if (benar.trim().toUpperCase() == "N" ) {
                                    transfer()
                                }else {
                                    console.log(clc.red("Anda salah memasukkan inputan"));
                                    
                                }
                               })
                            }
                        })
                        transfer()
                    }
                    

                    if (e == 3) {
                        await db("nasabah")
                        .where({ no_rekening})
                        .update({
                            status: "diblokir"
                        })
                        .catch(err => {
                            console.log(clc.red(err.message));
                        });
                        console.log(clc.red("Anda salah memasukkan PIN 3 kali, rekening anda di blokir !!"));
                        main()
                    }
                })
            }
            inputPIN(no_rekening, data.pin)
        }
    })
}

const ceksaldo = () => {
    rl.question("Masukkan No Rekening anda: " , async rekening => {
        const rek = await db("nasabah").where({no_rekening: rekening}).first()
        if (rekening.trim().length == 0) {
            console.log(clc.red("No Rekening harus di isi"));
            ceksaldo()
        }else if (rek.status == "diblokir") {
            console.log(clc.red("No Rekening di blokir"));
            ceksaldo()
        }else if (!rek) {
            console.log(clc.red("No Rekening tidak terdaftar"));
            ceksaldo()
        }else {
            rl.question("Masukkan PIN anda: " ,pin => {
                if (pin.trim().length == 0) {
                    console.log(clc.red("PIN harus di isi!!"));
                    ceksaldo()
                }else  {
                    console.log("### info saldo ###");
                    console.log("Saldo          : " + rek.saldo);   
                    main()     
                }
            })
        }
    })
}

main()