// Timeline Events Data Structure
const TIMELINE_EVENTS = [
    {
        id: 'ada-1843',
        year: '1843',
        title: { 
            en: 'Ada Lovelace', 
            es: 'Ada Lovelace' 
        },
        description: { 
            en: 'First Computer Program',
            es: 'Primer Programa de Computadora'
        },
        details: {
            en: 'Ada Lovelace is considered the first computer programmer, as she wrote the first algorithm intended to be processed by a machine - Charles Babbage\'s Analytical Engine.',
            es: 'Ada Lovelace es considerada la primera programadora, ya que escribió el primer algoritmo destinado a ser procesado por una máquina - el Motor Analítico de Charles Babbage.'
        },
        color: '#FF6B6B',
        media: {
            type: 'image',
            url: 'media/ada.jpg',
            thumbnail: 'thumbnails/ada-thumb.webp'
        }
    },
    {
        id: 'turing-1936',
        year: '1936',
        title: { 
            en: 'Alan Turing', 
            es: 'Alan Turing' 
        },
        description: {
            en: 'Turing Machine',
            es: 'Máquina de Turing'
        },
        details: {
            en: 'Alan Turing introduced the concept of a theoretical computing machine that could simulate any algorithm. This laid the foundation for modern computer science.',
            es: 'Alan Turing introdujo el concepto de una máquina de computación teórica que podía simular cualquier algoritmo. Esto sentó las bases de la informática moderna.'
        },
        color: '#4ECDC4',
        media: {
            type: 'image',
            url: 'media/turing.jpg',
            thumbnail: 'thumbnails/turing-thumb.webp'
        }
    },
    {
        id: 'hopper-1952',
        year: '1952',
        title: { 
            en: 'Grace Hopper', 
            es: 'Grace Hopper' 
        },
        description: {
            en: 'First Compiler',
            es: 'Primer Compilador'
        },
        details: {
            en: 'Grace Hopper developed the first compiler, A-0, which translated mathematical code into machine language. This innovation paved the way for modern programming languages.',
            es: 'Grace Hopper desarrolló el primer compilador, A-0, que traducía código matemático a lenguaje de máquina. Esta innovación allanó el camino para los lenguajes de programación modernos.'
        },
        color: '#45B7D1',
        media: {
            type: 'image',
            url: 'media/hopper.jpg',
            thumbnail: 'thumbnails/hopper-thumb.webp'
        }
    },
    {
        id: 'von-neumann-1945',
        year: '1945',
        title: { 
            en: 'Von Neumann Architecture', 
            es: 'Arquitectura de Von Neumann' 
        },
        description: {
            en: 'Stored Program Computer',
            es: 'Computadora de Programa Almacenado'
        },
        details: {
            en: 'John von Neumann described a computer architecture in which the data and the program are both stored in the computer\'s memory. This architecture became the foundation for modern computer design.',
            es: 'John von Neumann describió una arquitectura de computadora en la que tanto los datos como el programa se almacenan en la memoria de la computadora. Esta arquitectura se convirtió en la base del diseño moderno de computadoras.'
        },
        color: '#FF9F1C',
        media: {
            type: 'image',
            url: 'media/von-neumann.jpg',
            thumbnail: 'thumbnails/von-neumann-thumb.webp'
        }
    },
    {
        id: 'berners-lee-1989',
        year: '1989',
        title: { 
            en: 'Tim Berners-Lee', 
            es: 'Tim Berners-Lee' 
        },
        description: {
            en: 'World Wide Web',
            es: 'World Wide Web'
        },
        details: {
            en: 'Tim Berners-Lee invented the World Wide Web while working at CERN. He developed the first web browser, server, and the HTTP protocol, revolutionizing how information is shared.',
            es: 'Tim Berners-Lee inventó la World Wide Web mientras trabajaba en CERN. Desarrolló el primer navegador web, servidor y el protocolo HTTP, revolucionando la forma en que se comparte la información.'
        },
        color: '#2A9D8F',
        media: {
            type: 'image',
            url: 'media/berners-lee.jpg',
            thumbnail: 'thumbnails/berners-lee-thumb.webp'
        }
    },
    {
        id: 'thompson-ritchie-1970',
        year: '1970',
        title: { 
            en: 'Thompson & Ritchie', 
            es: 'Thompson & Ritchie' 
        },
        description: {
            en: 'UNIX & C Language',
            es: 'UNIX y Lenguaje C'
        },
        details: {
            en: 'Ken Thompson and Dennis Ritchie created the UNIX operating system and the C programming language at Bell Labs, fundamentally influencing modern computing and software development.',
            es: 'Ken Thompson y Dennis Ritchie crearon el sistema operativo UNIX y el lenguaje de programación C en Bell Labs, influenciando fundamentalmente la informática moderna y el desarrollo de software.'
        },
        color: '#E9C46A',
        media: {
            type: 'image',
            url: 'media/unix.jpg',
            thumbnail: 'thumbnails/unix-thumb.webp'
        }
    }
];

// Export for ES modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TIMELINE_EVENTS;
}
