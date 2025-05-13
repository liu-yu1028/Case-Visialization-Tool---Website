const labels = [];
const pressure = [];
const rate = [];
const sugar = [];
const temperature = [];

const ctx = document.getElementById("myChart").getContext('2d');
const myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets:[
      {
        label: "心率(bpm)",
        data: rate,
        borderColor:"rgba(0,123,255,1)",
        backgroundColor:"rgba(0,123,255,0.2)"
      },
      {
        label: "血糖(mg/dl)",
        data: sugar,
        borderColor:"rgba(253,126,20,1)",
        backgroundColor:"rgba(253,126,20,0.2)"
      },
      {
        label: "體溫(°C)",
        data: temperature,
        borderColor:"rgba(111,66,193,1)",
        backgroundColor:"rgba(111,66,193,0.2)"
      }
    ]
  },
  options: {
    responsive:true,
    scales:{
      y:{
        beginAtZero: false
      }
    }
  }
});

const patientsData = {};

function updateChartForPatient(name){
  const patient = patientsData[name];
  if(!patient) return;

  myChart.data.labels = patient.labels;
  myChart.data.datasets[0].data = patient.rate;
  myChart.data.datasets[1].data = patient.sugar;
  myChart.data.datasets[2].data = patient.temperature;

  document.getElementById("currentPatient").textContent = `目前使用者：${name}`;
  myChart.update();
}

document.getElementById("dataform").addEventListener("submit",function(e){
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  if(!name){
    alert("請輸入名字");
    return;
  }

  if(!patientsData[name]){
    patientsData[name] = {
      labels: [],
      rate: [],
      sugar: [],
      temperature: []
    };

    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    document.getElementById("patientSelect").appendChild(option);
  }

  const pressureValue = document.getElementById("pressure").value.trim(); // 修正
  const rateValue = parseInt(document.getElementById("rate").value, 10);
  const sugarValue = parseInt(document.getElementById("sugar").value, 10);
  const temperatureValue = parseFloat(document.getElementById("temperature").value);

  const entryLabel = `第${patientsData[name].labels.length + 1}天`;
  patientsData[name].labels.push(entryLabel);
  patientsData[name].rate.push(rateValue);
  patientsData[name].sugar.push(sugarValue);
  patientsData[name].temperature.push(temperatureValue);

  checkHealthWarnings({
    pressure: pressureValue,
    rate: rateValue,
    sugar: sugarValue,
    temperature: temperatureValue
  });

  updateChartForPatient(name);

  document.getElementById("pressure").value="";
  document.getElementById("rate").value="";
  document.getElementById("sugar").value="";
  document.getElementById("temperature").value="";
});

document.getElementById("patientSelect").addEventListener("change", function(){
  const selectedName = this.value;
  if(selectedName){
    updateChartForPatient(selectedName);
  }
});

function checkHealthWarnings({
  pressure, rate, sugar, temperature
}){
  const warnings = [];

["pressure", "rate", "sugar", "temperature"].forEach(id =>{
  document.getElementById(id).classList.remove("input-error");
})

  let systolic = null;
  let diastolic = null;

  if(typeof pressure === "string" && pressure.includes('/')){
    const parts = pressure.split('/').map(p => parseInt(p.trim(), 10));
    if(parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])){
      [systolic, diastolic] = parts;

      if(systolic < 0 || diastolic < 0){
        warnings.push("血壓不可為負值");
        document.getElementById("pressure").classList.add("input-error");
      }
    }else{
      warnings.push("血壓格式錯誤，請輸入如「120/80」的格式");
      document.getElementById("pressure").classList.add("input-error");
    }
  }else{
    warnings.push("血壓格式錯誤，請輸入如「120/80」的格式");
    document.getElementById("pressure").classList.add("input-error");

  }

  if(systolic !== null && diastolic !== null){
    if(systolic < 90 || diastolic < 60){
      warnings.push("低血壓，可能有頭暈、昏厥、休克、器官灌流不足等問題");
    }else if(systolic > 120 || diastolic > 80){
      warnings.push("高血壓，可能有心臟病、中風、腎功能受損等問題");
    }
  }

  if(isNaN(rate) || rate < 0){
    warnings.push("心率不可為負值");
    document.getElementById("rate").classList.add("input-error");
  }else{
    if(rate < 60){
    warnings.push("心率過慢，可能有供血不足、昏厥、心臟傳導異常等問題");
  }else if(rate > 100){
    warnings.push("心率過快，可能有心律不整、腎衰竭、心肌缺氧、焦慮症狀等問題");
  }
}
  
if(isNaN(sugar) || sugar < 0){
  warnings.push("血糖不可為負值");
  document.getElementById("sugar").classList.add("input-error");
}else{
  if(sugar < 90){
    warnings.push("低血糖，可能有頭暈、顫抖、昏迷、抽搐等問題");
    
  }else if(sugar > 139){
    warnings.push("高血糖，可能有糖尿病、腎病變、視網膜病變、神經病變等問題")
  }
}
  if(isNaN(temperature) || temperature < 0){
  warnings.push("體溫不可為負值");
  document.getElementById("temperature").classList.add("input-error");
}else{
  if(temperature < 34.7){
    warnings.push("體溫過低，可能有器官功能減退、心律不整、昏迷等問題");
    
  }else if(temperature > 37.3){
    warnings.push("發燒，可能有細菌病毒感染、自體免疫疾病、中暑、敗血症等問題")
  }
}

  const warningList = document.getElementById("warnings");
  warningList.innerHTML = "";

  if(warnings.length === 0){
    const li = document.createElement("li");
    li.textContent = "目前無異常指標，一切正常";
    li.classList.add("health-ok");
    warningList.appendChild(li);
  }else{
    warnings.forEach(message => {
      const li = document.createElement("li");
      li.textContent = message;
      li.classList.add("health-warning");
      warningList.appendChild(li);
    });
  }
}
