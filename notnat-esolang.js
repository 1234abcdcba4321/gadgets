"use strict"

ITER_CAP = 1000;

function run() {
  const code = document.getElementById("code").value;
  let mem = [];
  for (let i=0;i<code.length;i++) {
    if (code[i] == "{") {
      let end = code.indexOf("}",i);
      if (end == -1) {
        document.getElementById("io").value = "Error: mismatched {";
        return;
      }
      let num = parseInt(code.substring(i+1,end));
      mem.push(num);
      i = end;
    } else if (code[i] == "\\") {
      i++;
      if (code[i] == "\\" || code[i] == "{") mem.push(code.charCodeAt(i));
      else {
        mem.push(parseInt(code[i] + code[i+1],16));
        i++;
      }
    } else mem.push(code.charCodeAt(i));
  }
  while (mem.length < 16) mem.push(0);

  const inp = document.getElementById("io").value;
  let io = [];
  for (let i=0;i<inp.length;i++) {
    io[i] = inp.charCodeAt(i);
  }

  const updateOps = function() {
    mem[6] = (mem[4] == mem[5])?1:0;
    mem[7] = (mem[4] > mem[5])?1:0;
    mem[8] = Math.abs(mem[4] - mem[5]);
    mem[9] = mem[4] * mem[5];
    mem[10] = Math.trunc(mem[4] / mem[5]);
    mem[11] = mem[4] % mem[5];
  }
  const setMem = function(s,v) {
    mem[s]=v;
    if (s == 4 || s == 5) updateOps();
    if (s == 2) mem[3] = u0(io[mem[2]]);
    if (s == 3) {
      io[mem[2]] = v;
  //if (v == 0 && io.length-1 == mem[2]) io.pop();
    }
  }
/*  const getMem = function(s) {
    if (mem[s] == undefined) return 0;
    return mem[s];
  }*/
  const u0 = function(v) {
    if (v===undefined) return 0;
    return v;
  }
  const pushStack = function(v) {
    mem[15] = mem[14];
    mem[14] = mem[13];
    mem[13] = mem[12];
    mem[12] = v;
  }
  const popStack = function() {
    const rv = mem[12];
    mem[12] = mem[13];
    mem[13] = mem[14];
    mem[14] = mem[15];
    mem[15] = 0;
    return rv;
  }

  updateOps()
  mem[3] = u0(io[mem[2]]);

  console.log(mem);
  let j=0;
  while (mem[1] < mem.length) {
    const instr = u0(mem[mem[1]]);
    //console.log(j,instr,mem[12],mem);
    if (instr >= 48 && instr < 58) pushStack(instr-48);     //0-9
    else if (instr > 64 && instr <= 70) pushStack(instr-55);//A-F
    else if (instr == 33) mem[12] = u0(mem[mem[12]]);       //!
    else if (instr == 61) {     //=
      const v = popStack();
      const s = popStack();
      setMem(v,s);
    } else if (instr == 43) {   //+
      const a = popStack();
      mem[12] += a;
    }
    mem[1]++;
    if (j++>ITER_CAP) {
      console.log(mem);
      document.getElementById("io").value = "Program ran for pretty long; did you hit an infloop? Raise this limit by changing ITER_CAP in the console.";
      return;
    }
  }

  while (io.length>0 && (io[io.length-1] === 0 || io[io.length-1] === undefined)) io.pop();
  document.getElementById("io").value = String.fromCharCode(...io);
}