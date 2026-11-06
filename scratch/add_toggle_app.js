const fs = require('fs');
let app = fs.readFileSync('www/js/app.js', 'utf8');

const toggleFunc = `

window.togglePainelExecutivoProgramas = function() {
  const $cont = $('#tematicas_container_resumo_executivo');
  const $icon = $('#icon_toggle_painel_programas');
  const $txt = $('#txt_toggle_painel_programas');
  if ($cont.is(':visible')) {
    $cont.slideUp(200);
    $icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
    $txt.text('Expandir Painel');
  } else {
    $cont.slideDown(200);
    $icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
    $txt.text('Recolher Painel');
  }
};
`;

if (!app.includes('togglePainelExecutivoProgramas')) {
  app += toggleFunc;
  fs.writeFileSync('www/js/app.js', app, 'utf8');
  console.log('App.js updated with toggle function');
} else {
  console.log('Already exists');
}
