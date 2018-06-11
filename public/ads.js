const e = document.createElement('div');
e.id = ucivitOptions.detectAdBlockNodeID;
e.style.display = 'none';
document.body.appendChild(e);

// Temporary code to hide the ATS
const ATS_STUDY_A = ['5ab6ab23-66d0-4078-bcc6-15204a49627f'];
const ATS_STUDY_B = ['80a7fbd2-3468-4afb-8c94-392be3e03043'];
const ATS_STUDY_C = ['930e9a10-b17e-4288-81df-a961680fd36c'];

if (ATS_STUDY_B.includes(ucivitOptions.userId)) {
  console.log('Group B user');
  $('#ats_right').hide();
} else if (ATS_STUDY_C.includes(ucivitOptions.userId)) {
  console.log('Group C user');
  $('<style>#ats_right { display: none; }</style>').appendTo('head');
} else if (ATS_STUDY_A.includes(ucivitOptions.userId)) {
  console.log('Group A user');
}
