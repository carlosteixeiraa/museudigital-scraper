const cheerio = require('cheerio'),
      axios = require('axios'),
      mongoose = require('mongoose');


mongoose.connect('mongodb://localhost:27017/museudigital', {useNewUrlParser: true, useUnifiedTopology: true});

const Peca = mongoose.model('Pecas', { 
    titulo: {
        type: String,
        unique: true
    },
    ano: String,
    artista: String,
    materiais: String,
    dimensoes: String,
    imagem: String,
    descricao: String
});

for (let i = 1; i < 8; i++) {

var base = "http://www.museuartecontemporanea.gov.pt";
var artistas = "http://www.museuartecontemporanea.gov.pt/Artists/index/page:";
var titulo, ano, artista, materiais, dimensoes, imagem, descricao;

axios.get(artistas + i).then((response) => {
    //console.log(artistas + i);
    let $ = cheerio.load(response.data);

    $('.searchresult a').each((i, el) => {
        let link = $(el).attr('href');;   
        //console.log(link);

        axios.get(base + link).then((response) => {
            let $ = cheerio.load(response.data);

            $('.work').each((i, el) => {
                let pintura = $(el).attr('href');  
                //console.log(pintura);  
                
                axios.get(base + pintura).then((response) => {
                    let $ = cheerio.load(response.data);

                    $('.artistPieces h1').each((i, el) => {
                        let pinturaTitle = $(el).text();
                        if(pinturaTitle.includes('Museu do Chiado')) {
                            return;
                        } else {
                            console.log(' ');
                            titulo = pinturaTitle;
                        }
                    });

                    $('.artistPieces h2').each((i, el) => {
                        let pinturaAno = $(el).text().replace(', ', '');
                        if(pinturaAno.includes('s.d.')) {
                            ano = 'Sem data';
                        } else {
                            ano = pinturaAno;
                        }                      
                    });

                    $('.artistPieces h3').each((i, el) => {
                        let pinturaArtista = $(el).text();
                        if(pinturaArtista.includes('Outras obras') ||pinturaArtista.includes('Partilha')) {
                            return;
                        } else {
                            artista = pinturaArtista
                        }                    
                    });

                    $('.materials').each((i, el) => {
                        let pinturaMateriais = $(el).text();
                        materiais = pinturaMateriais
                    });

                    $('.dimensions').each((i, el) => {
                        let pinturaDimensoes = $(el).text().replace(/ /gm, "");
                        dimensoes = pinturaDimensoes
                    });

                    
                    $('.click-photo').each((i, el) => {
                        let pinturaImagem = $(el).attr('href');
                        imagem = pinturaImagem
                    });

                    $('.description').each((i, el) => {
                        let pinturaDesc = $(el).text().replace(/(\r\n|\n|\t|\r)/gm, "");;
                        descricao = pinturaDesc;
                        var pinturaWhole = {
                            titulo: titulo,
                            ano: ano,
                            artista: artista,
                            materiais: materiais,
                            dimensoes: dimensoes,
                            imagem: imagem,
                            descricao: descricao,
                        }

                        const savePeca = new Peca(pinturaWhole);
                        savePeca.save().then(() => console.log('Saved'));
                        //console.log(pinturaWhole);
                    });

                });



            });

        
        })

    });

}).catch((error) => {

    console.log(error);

});
    
    
}
