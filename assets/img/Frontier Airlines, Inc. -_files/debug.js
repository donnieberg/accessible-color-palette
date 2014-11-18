function tstIt()
{
  var x;
  buildMenu("elMenu1", array1, "secNavPopup");

  dumpID("elMenu1");
return;
  x = findObject("elMenu1_1");
  add(x.clientWidth);
  x = dumpID("elMenu1_1");
  x = x.style;
  dump(x);
  x = dumpID("HM_Item1_1");
  x = x.style;
  dump(x);
//  add(x.length);
//  setIt("HM_Menu1");
}


function tstItNew()
{
  var x;

  x = findObject("HM_Menu1");
  dumpLayers(x);
  dump(window);
return;
  x = findObject("elMenu1_1");
  add(x.clientWidth);
  x = dumpID("elMenu1_1");
  x = x.style;
  dump(x);
  x = dumpID("HM_Item1_1");
  x = x.style;
  dump(x);
//  add(x.length);
//  setIt("HM_Menu1");
}


function dumpChildren(key)
{
  x = findObject(key);
  dump(x);
  for (var i = 0; i < x.children.length; i++)
  {
    dump(x.children[i]);
  }
}

function setIt(key)
{
  var x = findObject(key);

  add("dump of " + key + " ");
  dump(x);
  if (!x)
    return;
  y = x.style;
  add("Dump of " + key + " style");
  dump(y);
}

function add(msg)
{
  return;
/*
var x;
  var y;

  x = findObject("fred");
  if (x)
  {
//    if(isIE4)
//      alert (x.innerText);
//      x.innerText += msg + '\n';
//    else
//x.y.z = x.y.q;
      x.value = x.value + msg + "\n";
//      alert(x.value);
  }
*/
}

function addClear()
{
  var x;
  x = findObject("fred");
  if (x)
  {
    if(isIE4)
      x.innerText = "";
    else
      x.value = "";
  }
}

function dumpUpTree(key)
{
  var obj;
  var obj1;
  var cntx = 0;

  obj = findObject(key);
  while (obj)
  {
    cntx++;
    if (cntx > 6)
      break;

    dump(obj);
    obj1 = obj.parentElement;
    if (obj1 == obj)
      break;
    obj = obj1;
  }
}

function dump1(obj)
{
  var names = "";
  var tmp;
  var cnt;
  var i;

  cnt = findObject("dump");
  if (!cnt || !cnt.checked)
    return;

  for (i in obj)
  {
    names += i + " - '" + obj[i] + "'\n";
  }
  add("********************");
add(obj)
  add(names);
  add("********************");
}

function dump(obj)
{
  var cnt;

  if (!obj)
    return;
//  cnt = findObject("dump");
//  if (!cnt || !cnt.checked)
//    return;

  add("********************");
  if (obj.id)
    add("*** Dump of id = " + obj.id);
  if (obj.name)
    add("*** Dump of name = " + obj.name);
  add(dumpObj(obj));
  if (obj.clip)
  {
    add("***");
    cnt = obj.clip;
    add(dumpObj(cnt));
  }
  add("********************");
}


function dumpObj(obj1, ind)
{
  var tmp;
  var cnt;
  var i;
  var names;
  var idnt;
  var itm;
  var val;
  var buf;

  buf = '';
  if (!ind)
    ind = 0;
  idnt = "";
  for (i = 0; i < ind; i++)
  {
    idnt += '  ';
  }

  names = "";
  tmp = new Array(obj1.length);
  cnt = 0;
  for (i in obj1)
  {
//    if (i != "innerHTML"  && i != "outerHTML" && i != "innerText" && i != "outerText")
    if (i != "parentLayer" && i != "window")
    {
      tmp[cnt] = i;
      cnt++;
    }
  }
  tmp.sort();
  for (i = 0; i < tmp.length; i++)
  {
    itm = tmp[i];
    val = obj1[itm];
    if (typeof val == 'function')
      continue;
    names += idnt + " * " + itm + " - '" + val + "'\n";
    if (itm == 'childNodes' || itm == 'style')
    {
      buf += names;
      names = '';
      buf += dumpObj(val, ind + 1);
    }
  }
  buf += names;
  return buf;
}


function dumpMenu(menu, lvl)
{
  var iDent;
  var i;

  if (!lvl)
  {
    lvl = 0;
    add("******************************************************************************");
  }
  iDent = "";
  for (i = 0; i < lvl; i++)
    iDent += "  ";
  add(iDent + "Menu " + menu.lclName + '  x=' + menu.left + '  y=' + menu.top + '  h=' + menu.clip.height + '  w=' + menu.clip.width);
  if (menu.parentMenu)
    add(iDent + "     parent " + menu.parentMenu.lclName);
  if (menu.off)
    add(iDent + "     off " + menu.off.lclName);
  if (menu.rollover)
    add(iDent + "     rollover " + menu.rollover.lclName);

  for (i = 0; i < menu.layers.length; i++)
    dumpMenu(menu.layers[i], lvl + 1);
  if (lvl == 0)
    add("******************************************************************************");
}

function dumpID(key)
{
  var obj;
  obj = findObject(key);
  dump(obj);
  return obj;
}


function dumpLayers(obj)
{
  var i;
  var x;
  if (obj)
  {
    dump(obj);
    if (obj.layers)
    {
      for (i = 0; i < obj.layers.length; i++)
      {
        add("+++++");
        dump(obj.layers[i]);
      }
    }
  }
}
