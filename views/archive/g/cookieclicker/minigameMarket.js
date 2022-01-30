var M={};
M.parent=Game.Objects['Bank'];
M.parent.minigame=M;
M.launch=function()
{
	var M=this;
	M.name=M.parent.minigameName;
	M.init=function(div)
	{
		//populate div with html and initialize values
				
		M.goods={
			'Farm':{
				name:'Cereals',
				symbol:'CRL',
				company:'Old Mills',
				desc:'<b>Old Mills</b> is a trusted staple of the grain industry. Finding their roots in humble pioneer farms centuries ago and honing their know-how ever since, the Old Mills organic crops have reached a standard of quality that even yours struggle to equal.',
			},
			'Mine':{
				name:'Chocolate',
				symbol:'CHC',
				company:'Cocoa Excavations',
				desc:'<b>Cocoa Excavations</b> is an international chocolate mining venture whose extraction sites always seem, somehow, to pop up in war-torn countries. Their high-grade chocolate is renowned the world over and has even been marketed, to some success, as suitable gems for engagement rings.',
			},
			'Factory':{
				name:'Butter',
				symbol:'BTR',
				company:'Bovine Industries',
				desc:'<b>Bovine Industries</b> is a formerly-agricultural conglomerate that now deals in mechanized dairy mass production. Whistleblowers have drawn attention to the way the milk cows employed by this company are treated, describing it as "not quite cruel or anything, but definitely unusual".',
			},
			'Bank':{
				name:'Sugar',
				symbol:'SUG',
				company:'Candy Trust',
				desc:'The <b>Candy Trust</b> is a corporate banking group backed by, and specialized in, the trade of high-grade sugar. The origin of said sugar is legally protected by an armada of lawyers, though some suspect they secretly scrape it off of the bank bills coming in before processing it.',
			},
			'Temple':{
				name:'Nuts',
				symbol:'NUT',
				company:'Hazel Monastery',
				desc:'Hidden between hills and fog somewhere, the secretive <b>Hazel Monastery</b> has, for centuries, maintained nut crops of the highest quality. The monastery nuts are carefully tended to, harvested and shelled by its monks, who are all required to take a vow of nut allergy as a lifelong test of piety.',
			},
			'Wizard tower':{
				name:'Salt',
				symbol:'SLT',
				company:'Wacky Reagants',
				desc:'Salt is a versatile substance, with properties both mundane and mystical. This is why the bearded crackpots at <b>Wacky Reagants</b> have perfected the art of turning magic powder into salt, which is then sold to anyone promising to put it to good use - whether it be warding off banshees and ghouls or seasoning a Sunday roast.',
			},
			'Shipment':{
				name:'Vanilla',
				symbol:'VNL',
				company:'Cosmic Exports',
				desc:'After the news broke of vanilla not being native to Earth, <b>Cosmic Exports</b> was the first company to discover its true origin planet - and has struck an exclusive deal with its tentacled inhabitants to ship its valuable, unadulterated beans all over the local quadrant.',
			},
			'Alchemy lab':{
				name:'Eggs',
				symbol:'EGG',
				company:'Organic Gnostics',
				desc:'At <b>Organic Gnostics</b>, an egg is seen as a promise. A promise of life and nourishment, of infinite potential, of calcium and protein. An egg can become many things... especially when you\'re properly funded and don\'t believe there\'s room in science for rules or ethics.',
			},
			'Portal':{
				name:'Cinnamon',
				symbol:'CNM',
				company:'Dimensional Exchange',
				desc:'The <b>Dimensional Exchange</b> employs a vast team of ragtag daredevils to dive into dangerous underworlds in search of strange native spices. Chief among those is cinnamon, a powder so delicious its true nature can only be unspeakably abominable.',
			},
			'Time machine':{
				name:'Cream',
				symbol:'CRM',
				company:'Precision Aging',
				desc:'Once specialized in cosmetics for the elderly, the eggheads at <b>Precision Aging</b> have repurposed their timeshift technology and developed a process allowing them to accelerate, slow down, and even reverse the various phase changes of milk. Their flagship offering, whole cream, is said to be within 0.002% of theoretical ripening optimums.',
			},
			'Antimatter condenser':{
				name:'Jam',
				symbol:'JAM',
				company:'Pectin Research',
				desc:'<b>Pectin Research</b> is a military-backed laboratory initially created with the aim of enhancing and miniaturizing army rations, but now open for public bulk trading. It has recently made forays in the field of highly-concentrated fruit jams, available in a variety of flavors.',
			},
			'Prism':{
				name:'White chocolate',
				symbol:'WCH',
				company:'Dazzle Corp Ltd.',
				desc:'What was once two college kids messing around with mirrors in their dad\'s garage is now a world-famous megacorporation. <b>Dazzle Corp</b>\'s groundbreaking experiments in photonic annealing have led to the creation years ago of a new kind of matter, once derided as impossible by physicists and cooks alike: white chocolate.',
			},
			'Chancemaker':{
				name:'Honey',
				symbol:'HNY',
				company:'Prosperity Hive',
				desc:'The folks at <b>Prosperity Hive</b> deal in honey, and it\'s always worked for them. With a work culture so relaxed you\'re almost tempted to ditch the cookie business and join them, these people have little in common with the proverbial busy bee - though their rates do sting quite a bit.',
			},
			'Fractal engine':{
				name:'Cookies',
				symbol:'CKI',
				company:'Selfmade Bakeries',
				desc:'Interesting. It appears there\'s still a company out there trying to sell cookies even with your stranglehold on the market. No matter - you figure <b>Selfmade Bakeries</b>\' largely inferior product will make decent fodder for the mouse traps in your factories.',
			},
			'Javascript console':{
				name:'Recipes',
				symbol:'RCP',
				company:'Figments Associated',
				desc:'In a post-material world, the market of ideas is where value is created. <b>Figments Associated</b> understands that, and is the prime designer (and patenter) of baking recipes, ingredient nomenclature, custom cooking procedures, and other kitchen processes.',
			},
			'Idleverse':{
				name:'Subsidiaries',
				symbol:'SBD',
				company:'Polyvalent Acquisitions',
				desc:'Avoid the uncouth nastiness of mass layoffs and hostile takeovers by delegating the purchase, management, and eventual dissolution of other companies to the boys at <b>Polyvalent Acquisitions</b>. Let \'em deal with it!',
			},
		};
		M.goodsById=[];var n=0;
		for (var i in M.goods){var it=M.goods[i];it.id=n;it.hidden=false;it.active=false;it.last=0;it.building=Game.Objects[i];it.stock=0;it.mode=0;it.dur=0;it.val=1;it.vals=[it.val];it.d=0;M.goodsById[n]=it;it.icon=[it.building.iconColumn,33];n++;}
		
		M.goodTooltip=function(id)
		{
			return function(){
				var me=M.goodsById[id];
				var delta=M.goodDelta(id);
				var val=M.getGoodPrice(me)
				icon=me.icon||[0,0];
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
				'<div class="name">'+me.name+' <span style="font-size:12px;opacity:0.8;">(from <span style="font-variant:small-caps;">'+me.company+'</span>)</span> <span class="bankSymbol">'+me.symbol+' <span class="bankSymbolNum'+(delta>=0?' bankSymbolUp':delta<0?' bankSymbolDown':'')+'">'+(delta+''+(delta==Math.floor(delta)?'.00':(delta*10)==Math.floor(delta*10)?'0':'')+'%')+'</span></span></div>'+
				'<div class="line"></div><div class="description">'+
					'<q>'+me.desc+'</q>'+
					'<div class="line"></div><div style="font-size:11px;">&bull; <div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div> '+me.name+': currently worth <b>$'+Beautify(val,2)+'</b> per unit.<br>&bull; You currently own <div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div> <b>'+Beautify(me.stock)+'</b>x '+me.name+' (worth <b>$'+Beautify(val*me.stock,2)+'</b>).<br>&bull; Your warehouses can store up to <div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div> <b>'+Beautify(M.getGoodMaxStock(me))+'</b>x '+me.name+'.<br>&bull; You may increase your storage space by upgrading your offices and by buying more <div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-me.building.iconColumn*48)+'px '+(0*48)+'px;"></div> '+me.building.plural+'. You also get 10 extra storage space per '+me.building.single+' level (currently: <b>+'+(me.building.level*10)+'</b>).<br>&bull; The average worth of this stock and how high it can peak depends on the building it is tied to, along with the level of your <div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-15*48)+'px '+(0*48)+'px;"></div> banks.</div>'+
					'<div style="font-size:11px;opacity:0.5;margin-top:3px;">Shift-click the hide button to toggle all other stocks.</div>'+
				'</div></div>';
				return str;
			};
		}
		M.tradeTooltip=function(id,n)
		{
			return function(){
				var me=M.goodsById[id];
				var icon=me.icon||[0,0];
				var val=M.getGoodPrice(me)
				var cost=Game.cookiesPsRawHighest*val;
				var buyOrSell=n>0;
				var overhead=1;
				var stock=me.stock;
				var maxStock=M.getGoodMaxStock(me);
				if (buyOrSell) overhead*=1+0.01*(20*Math.pow(0.95,M.brokers));
				cost*=overhead;
				if (n==10000) n=Math.floor(Game.cookies/cost);
				else if (n==-10000) n=me.stock;
				n=Math.abs(n);
				if (buyOrSell) n=Math.min(n,maxStock-stock);
				if (!buyOrSell) n=Math.min(n,stock);
				var str='<div style="padding:8px 4px;min-width:128px;text-align:center;font-size:11px;">'+
					'<div style="font-size:9px;opacity:0.6;">Stock: <b'+((!buyOrSell && stock==0)?' class="red"':'')+'>'+Beautify(stock)+'</b>/<b'+((buyOrSell && stock>=maxStock)?' class="red"':'')+'>'+Beautify(maxStock)+'</b></div>'+
					'<div class="line"></div>'+
					'<div>'+(buyOrSell?'Buy':'Sell')+' <b>'+Beautify(n)+'</b>x <div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div> '+me.name+'</div>'+
					'<div>for <b>$'+Beautify(val,2)+'</b> each</div>'+
					(overhead>1?('<div style="font-size:9px;opacity:0.6;">(+<b>'+Beautify((overhead-1)*100,2)+'%</b> overhead)</div>'):'')+
					'<div class="line"></div>'+
					'<div style="font-size:9px;opacity:0.6;font-weight:bold;">'+(buyOrSell?'you spend':'you earn')+':</div>'+
					'<div><b class="hasTinyCookie '+(n<=0?'gray':(Game.cookies>=cost*n || !buyOrSell)?'green':'red')+'">'+Beautify(cost*n)+'</b></div>'+
					(n>0?('<div style="font-size:9px;opacity:0.6;font-weight:bold;">($'+Beautify(val*overhead*n,2)+')</div>'+
					'<div style="font-size:9px;opacity:0.6;font-weight:bold;">('+Game.sayTime(val*overhead*n*Game.fps,-1)+' of CpS)</div>'):'')+
					(((me.last==1 && !buyOrSell) || (me.last==2 && buyOrSell))?'<div class="line"></div><div class="red">You cannot buy and sell this stock in the same tick.</div>':'')+
				'</div>';
				return str;
			};
		}
		
		M.goodDelta=function(id,back)//if back is 0 we get the current step; else get current step -back
		{
			var back=back||0;
			var me=M.goodsById[id];
			var val=0;
			if (me.vals.length>=(2+back))
			{
				val=me.vals[0+back]/me.vals[1+back]-1;
			}
			val=Math.floor(val*10000)/100;
			return val;
		}
		
		M.getGoodMaxStock=function(good)
		{
			var bonus=0;
			if (M.officeLevel>0) bonus+=25;
			if (M.officeLevel>1) bonus+=50;
			if (M.officeLevel>2) bonus+=75;
			if (M.officeLevel>3) bonus+=100;
			return Math.ceil(good.building.highest*(M.officeLevel>4?1.5:1)+bonus+good.building.level*10);
		}
		M.getGoodPrice=function(good)
		{
			return good.val;
		}
		M.buyGood=function(id,n)
		{
			var me=M.goodsById[id];
			var costInS=M.getGoodPrice(me);
			var cost=Game.cookiesPsRawHighest*costInS;
			var overhead=1+0.01*(20*Math.pow(0.95,M.brokers));
			cost*=overhead;
			if (n==10000) n=Math.floor(Game.cookies/cost);
			n=Math.min(n,M.getGoodMaxStock(me)-me.stock);
			if (n>0 && me.last!=2 && Game.cookies>=cost*n && me.stock+n<=M.getGoodMaxStock(me))
			{
				if (costInS*overhead*n>=86400) Game.Win('Buy buy buy');
				M.profit-=costInS*overhead*n;
				Game.Spend(cost*n);
				me.stock+=n;
				var min=10000;
				for (var i=0;i<M.goodsById.length;i++)
				{
					var it=M.goodsById[i];
					min=Math.min(min,it.stock);
					if (it.stock>=1000) Game.Win('Full warehouses');
				}
				if (min>=100) Game.Win('Rookie numbers');
				if (min>=500) Game.Win('No nobility in poverty');
				me.last=1;
				PlaySound('snd/cashOut.mp3',0.4);
				return true;
			}
			return false;
		}
		M.sellGood=function(id,n)
		{
			var me=M.goodsById[id];
			if (n==10000) n=me.stock;
			n=Math.min(n,me.stock);
			if (n>0 && me.last!=1 && me.stock>0)
			{
				var costInS=M.getGoodPrice(me);
				if (costInS*n>=86400) Game.Win('Make my day');
				M.profit+=costInS*n;
				if (M.profit>0) Game.Win('Initial public offering');
				if (M.profit>=10000000) Game.Win('Liquid assets');
				if (M.profit>=31536000) Game.Win('Gaseous assets');
				//Game.Earn(Game.cookiesPsRawHighest*costInS*n);
				Game.cookies+=Game.cookiesPsRawHighest*costInS*n;
				Game.cookiesEarned=Math.max(Game.cookies,Game.cookiesEarned);
				me.stock-=n;
				me.last=2;
				PlaySound('snd/cashIn.mp3',0.4);
				return true;
			}
			return false;
		}
		M.getRestingVal=function(id)
		{
			return 10+10*id+(Game.Objects['Bank'].level-1);
		}
		
		M.updateGoodStyle=function(id)
		{
			var me=M.goodsById[id];
			if (me.active)
			{
				me.l.style.display='inline-block';
				if (!me.hidden)
				{
					me.viewHideL.innerHTML='Hide';
					me.l.classList.remove('bankHidden');
					me.graphIconL.style.display='block';
				}
				else
				{
					me.viewHideL.innerHTML='View';
					me.l.classList.add('bankHidden');
					me.graphIconL.style.display='none';
				}
			}
			else
			{
				me.l.style.display='none';
				me.graphIconL.style.display='none';
			}
		}
		
		M.officeLevel=0;
		M.offices=[
			{name:'Credit garage',icon:[0,33],cost:[100,2],desc:'This is your starting office.<br>Upgrading will grant you:<br><b><!--&bull; +1 opportunity slot<br>-->&bull; +25 warehouse space for all goods</b>'},
			{name:'Tiny bank',icon:[9,33],cost:[200,4],desc:'This is your office.<br>Upgrading will grant you:<br><b>&bull; +1 loan slot<br>&bull; +50 warehouse space for all goods</b>'},
			{name:'Loaning company',icon:[10,33],cost:[350,8],desc:'This is your office.<br>Upgrading will grant you:<br><!--<b>&bull; +1 opportunity slot<br>-->&bull; +75 warehouse space for all goods</b>'},
			{name:'Finance headquarters',icon:[11,33],cost:[500,10],desc:'This is your office.<br>Upgrading will grant you:<br><b>&bull; +1 loan slot<br>&bull; +100 warehouse space for all goods</b>'},
			{name:'International exchange',icon:[12,33],cost:[700,12],desc:'This is your office.<br>Upgrading will grant you:<br><b>&bull; +1 loan slot<br><!--&bull; +1 opportunity slot<br>-->&bull; +50% base warehouse space for all goods</b>'},
			{name:'Palace of Greed',icon:[18,33],cost:0,desc:'This is your office.<br>It is fully upgraded. Its lavish interiors, spanning across innumerable floors, are host to many a decadent party, owing to your nigh-unfathomable wealth.'},
		];
		
		M.officeTooltip=function()
		{
			return function(){
				var me=M.offices[M.officeLevel];
				var icon=me.icon||[0,0];
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
				'<div class="name">'+me.name+' <span style="font-size:11px;opacity:0.6;">[Level '+(M.officeLevel+1)+' offices]</span></div>'+
				'<div class="line"></div><div class="description" style="font-size:11px;">'+
					me.desc+
				'</div>'+
				(me.cost?('<div class="line"></div><div style="font-size:11px;padding-left:24px;position:relative;">'+
					'<div id="bankOfficeIcon" class="icon" style="position:absolute;left:0px;top:6px;pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-11*48)+'px '+(-0*48)+'px;"></div>'+
					'Upgrading will cost you <b class="'+(Game.Objects['Cursor'].amount>=me.cost[0]?'green':'red')+'">'+me.cost[0]+' cursors</b>.<br>'+
					'Upgrading requires <b class="'+(Game.Objects['Cursor'].level>=me.cost[1]?'green':'red')+'">level '+me.cost[1]+' cursors</b>.'+
				'</div>'):'')+
				'</div>';
				return str;
			};
		}
		
		M.brokers=0;
		
		M.getMaxBrokers=function(){return Math.ceil(Game.Objects['Grandma'].highest/10+Game.Objects['Grandma'].level);}
		M.getBrokerPrice=function(){return Game.cookiesPsRawHighest*60*20;}
		M.brokersTooltip=function()
		{
			return function(){
				var icon=[1,33];
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="icon" style="float:left;margin-left:-8px;margin-top:-8px;background-position:'+(-icon[0]*48)+'px '+(-icon[1]*48)+'px;"></div>'+
				'<div class="name">Stockbrokers <span style="font-size:11px;opacity:0.6;">(you have '+Beautify(M.brokers)+')</span></div>'+
				'<div class="line"></div><div class="description" style="font-size:11px;">'+
					'A nice broker to trade more cookies.<br>'+
					'&bull; Buying goods normally incurs overhead costs of <b>20% extra</b>. Each broker you hire reduces that cost by <b>5%</b>.<br>'+
					'&bull; Current overhead costs thanks to your '+Beautify(M.brokers)+' broker'+(M.brokers==1?'':'s')+': <b>+'+Beautify(20*Math.pow(0.95,M.brokers),2)+'%</b><br>'+
					'&bull; Buying a broker costs <b class="hasTinyCookie '+(Game.cookies>=M.getBrokerPrice()?'green':'red')+'">20 minutes</b> of CpS (that\'s $1200).<br>'+
					'&bull; Maximum number of brokers you can own: <b class="'+(M.brokers<M.getMaxBrokers()?'green':'red')+'">'+Beautify(M.getMaxBrokers())+'</b> (the highest amount of grandmas you\'ve owned this run, divided by 10, plus your grandma level)<br>'+
					'<q>Brokers are Wall Street-class grandmas versed in the ways of finance. Stockbroker grandmas work hard and play hard, and will fight telephone in hand to get your clients the best possible deals - with a sizeable profit margin for you, of course.</q>'+
					'<div class="line"></div><div style="font-size:11px;text-align:center;">'+
						'Hiring a new broker will cost you <b class="hasTinyCookie '+(Game.cookies>=M.getBrokerPrice()?'green':'red')+'">'+Beautify(M.getBrokerPrice())+' cookies</b>.'+
					'</div>'+
				'</div>'+
				'</div>';
				return str;
			};
		}
		
		M.loanTypes=[
			//name, mult, duration, payback mult, duration, downpayment (as % of bank), quote
			['a modest loan',1.5,60*2,0.25,60*4,0.2,'Buy that vintage car you\'ve always wanted. Just pay us back.'],
			['a pawnshop loan',2,0.67,0.1,40,0.4,'Bad credit? No problem. It\'s your money, and you need it now.'],
			['a retirement loan',1.2,60*24*2,0.8,60*24*5,0.5,'Finance your next house, boat, spouse, etc. You\'ve earned it.'],
		];
		M.loanTooltip=function(id)
		{
			return function(){
				var loan=M.loanTypes[id-1];
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="name">Take out '+loan[0]+'</div>'+
				'<div class="line"></div><div class="description" style="font-size:11px;">'+
					'By taking this loan, you will get <b class="green">+'+Math.round((loan[1]-1)*100)+'%</b> CpS for the next <b>'+Game.sayTime(60*loan[2]*Game.fps)+'</b>.<br>'+
					'However, you will get <b class="red">'+Math.round((loan[3]-1)*100)+'%</b> CpS for the next <b>'+Game.sayTime(60*loan[4]*Game.fps)+'</b> after that.<br>'+
					'You must also pay an immediate downpayment of <b class="hasTinyCookie red">'+Beautify(Game.cookies*loan[5])+'</b> (<b>'+(loan[5]*100)+'%</b> of your current bank).<br>'+
					'<q>'+loan[6]+'</q>'+
				'</div>';
				return str;
			};
		}
		M.takeLoan=function(id,interest)
		{
			var loan=M.loanTypes[id-1];
			if (!interest)
			{
				if (Game.hasBuff('Loan '+id) || Game.hasBuff('Loan '+id+' (interest)')) return false;
				Game.Spend(Game.cookies*loan[5]);
				Game.gainBuff('loan '+id,loan[2]*60,loan[1]);
			}
			else
			{
				Game.gainBuff('loan '+id+' interest',loan[4]*60,loan[3]);
				Game.Notify('Loan over','Your loan has expired, and you must now repay the interest.',[1,33]);
			}
			return true;
		}
		Game.takeLoan=M.takeLoan;
		
		M.getOppSlots=function()
		{
			var slots=0;
			if (M.officeLevel>0) slots++;
			if (M.officeLevel>2) slots++;
			if (M.officeLevel>4) slots++;
			return slots;
		}
		
		//note : opportunity system to be added later maybe
		
		M.oppTooltip=function()
		{
			return function(){
				var str='<div style="padding:8px 4px;min-width:350px;">'+
				'<div class="name">Generate opportunity</div>'+
				'<div class="line"></div><div class="description" style="font-size:11px;">'+
					'Pressing this button gives you up to 3 possible actions to choose from, depending on your office level.<br>These actions will let you manipulate the stock market to some degree, though some are riskier than others.<br>You may only generate an opportunity once an hour, though this can be refreshed with a sugar lump.'+
				'</div>';
				return str;
			};
		}
		
		M.refillTooltip=function(){
			return '<div style="padding:8px;width:300px;font-size:11px;text-align:center;">Click to refill your opportunity timer (and give a quick burst to your economy) for <span class="price lump">1 sugar lump</span>.'+
				(Game.canRefillLump()?'<br><small>(can be done once every '+Game.sayTime(Game.getLumpRefillMax(),-1)+')</small>':('<br><small class="red">(usable again in '+Game.sayTime(Game.getLumpRefillRemaining()+Game.fps,-1)+')</small>'))+
			'</div>';
		};
		
		
		var str='';
		str+='<style>'+
		'#bankBG{background:url(img/shadedBorders.png),url(img/BGmarket.jpg);background-size:100% 100%,auto;position:absolute;left:0px;right:0px;top:0px;bottom:16px;}'+
		'#bankContent{position:relative;box-sizing:border-box;padding:4px;text-align:center;}'+
		
		'.bankGood{margin:2px;display:inline-block;width:156px;text-align:center;position:relative;left:0px;top:0px;right:0px;box-sizing:border-box;box-shadow:0px 0px 0px 1px rgba(255,255,255,0.1), 2px 2px 4px rgba(0,0,0,0.5) inset;background:rgba(0,0,0,0.9);color:rgba(255,255,255,0.7);}'+
		'.bankHidden{opacity:0.75;background:transparent;box-shadow:none;}'+
		'.bankButton{cursor:pointer;opacity:0.8;color:#94cd50;font-weight:bold;font-size:10px;border:1px solid #999;border-color:#94cd50 #1b7a2f #1b7a2f #94cd50;padding:2px 6px;margin:0px 1px 1px 0px;display:inline-block;}'+
		'.bankButtonBuy{color:#a358ff;border-color:#a358ff #3a52bc #3a52bc #a358ff;}'+
		'.bankButtonSell{color:#94cd50;border-color:#94cd50 #1b7a2f #1b7a2f #94cd50;}'+
		//'.bankButtonLess{color:#e25142;border-color:#e25142 #9a1225 #9a1225 #e25142;}'+
		'.bankButton:hover{opacity:1;}'+
		'.bankButton:active{color:#fff;}'+
		'.bankButtonOff{color:#999;border-color:#999 #666 #666 #999;opacity:0.6;}'+
		'.bankSymbol{font-weight:bold;font-size:10px;display:inline-block;padding:2px 4px;background:#333;text-shadow:0px 1px #000;}'+
		'.bankSymbolNum{font-weight:normal;}'+
		'.bankSymbolNum:after{content:\'=\';}'+
		'.bankSymbolUp{color:#73f21e;}'+
		'.bankSymbolUp:after{content:\'\u25b2\';}'+
		'.bankSymbolDown{color:#f21e3c;}'+
		'.bankSymbolDown:after{content:\'\u25bc\';}'+
		'#bankGraphBox{background:#fff;position:relative;z-index:5;overflow:hidden;height:300px;}'+
		'.bankGraphIcon{position:absolute;right:-24px;top:-24px;z-index:10;transform:scale(0);transition:transform 0.3s;}'+
		'.bankViewHide{position:absolute;z-index:10;padding:4px;top:-2px;right:0px;}'+
		'.bankSimpleButton{font-weight:bold;font-size:10px;cursor:pointer;text-decoration:underline;color:rgba(255,255,255,0.9);text-shadow:0px 1px #000;}'+
		'.bankSimpleButton:active{opacity:0.5;}'+
		'.bankSimpleButton:hover{color:#fff;}'+
		'</style>';
		
		str+='<div id="bankBG"></div>';
		str+='<div id="bankContent">';
			
			str+='<div id="bankHeader" style="z-index:10;position:relative;">'+
				'<div>'+
					'<div style="padding:1px 4px;font-size:10px;color:rgba(255,255,255,0.5);">Profits: <span id="bankBalance">$0</span>. All prices are in <b style="color:#fff;">$</b>econds of your highest raw cookies per second. <span id="bankNextTick"></span></div>'+
					'<div id="bankOffice" style="display:inline-block;padding:0px 4px;" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.officeTooltip()','this')+'><div id="bankOfficeIcon" class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -12px -14px;vertical-align:middle;background-position:'+(-0*48)+'px '+(-33*48)+'px;"></div><span id="bankOfficeName" class="bankSymbol" style="width:128px;"></span><div class="bankButton bankButtonBuy bankButtonOff" id="bankOfficeUpgrade">-</div></div>'+
					'<div id="bankBrokers" style="display:inline-block;padding:0px 4px;" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.brokersTooltip()','this')+'><div id="bankBrokersIcon" class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -12px -14px;vertical-align:middle;background-position:'+(-1*48)+'px '+(-33*48)+'px;"></div><span id="bankBrokersText" class="bankSymbol" style="width:96px;">no brokers</span><div class="bankButton bankButtonBuy bankButtonOff" id="bankBrokersBuy">Hire</div></div>'+
					'<div style="display:inline-block;padding:0px 4px;"><div id="bankLoan1" style="display:none;" class="bankButton bankButtonSell bankButtonOff" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.loanTooltip(1)','this')+'>1st loan</div><div id="bankLoan2" style="display:none;" class="bankButton bankButtonSell bankButtonOff" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.loanTooltip(2)','this')+'>2nd loan</div><div id="bankLoan3" style="display:none;" class="bankButton bankButtonSell bankButtonOff" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.loanTooltip(3)','this')+'>3rd loan</div></div>'+
					/*'<div style="display:inline-block;padding:0px 4px;"><div id="bankOpp" class="bankButton bankButtonBuy bankButtonOff" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.oppTooltip()','this')+'>Generate opportunity</div> <div class="bankSymbol" style="position:relative;font-size:10px;color:rgba(255,255,255,0.6);padding-left:16px;"><div '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.refillTooltip','this')+' id="bankLumpRefill" class="usesIcon shadowFilter lumpRefill" style="left:-18px;top:-18px;background-position:'+(-29*48)+'px '+(-14*48)+'px;"></div>refresh</div></div>'+*/
				'</div>';
			
			for (var i=0;i<M.goodsById.length;i++)
			{
				var me=M.goodsById[i];
				str+='<div class="bankGood" id="bankGood-'+me.id+'">'+
					'<div '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.goodTooltip('+me.id+')','this')+'>'+
						'<div class="icon" style="z-index:20;pointer-events:none;position:absolute;left:0px;top:0px;transform:scale(0.5);margin:-16px -16px;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>'+
						'<div class="bankSymbol" style="margin:1px 0px;display:block;padding:2px 0px;width:100%;overflow:hidden;white-space:nowrap;">'+me.symbol+' <span id="bankGood-'+me.id+'-sym" class="bankSymbolNum">-.--%</span></div>'+
						'<div class="bankViewHide bankSimpleButton" id="bankGood-'+me.id+'-viewHide">Hide</div>'+
						'<div class="bankSymbol" style="margin:1px 0px;display:block;font-size:10px;width:100%;background:linear-gradient(to right,transparent,#333,#333,transparent);padding:2px 0px;overflow:hidden;white-space:nowrap;">value: <span style="font-weight:bold;color:#fff;" id="bankGood-'+me.id+'-val">-</span></div>'+
						'<div class="bankSymbol" style="margin:1px 0px;display:block;font-size:10px;width:100%;background:linear-gradient(to right,transparent,#333,#333,transparent);padding:2px 0px;overflow:hidden;white-space:nowrap;" id="bankGood-'+me.id+'-stockBox">stock: <span style="font-weight:bold;" id="bankGood-'+me.id+'-stock">-</span><span style="font-weight:bold;" id="bankGood-'+me.id+'-stockMax">/-</span></div>'+
					'</div>'+
					'<div style="position:relative;white-space:nowrap;">'+
						'<div style="padding:3px 2px;width:22px;" class="bankSymbol">Buy</div>'+
						'<div class="bankButton bankButtonBuy" id="bankGood-'+me.id+'_1" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',1)','this')+'>1</div>'+
						'<div class="bankButton bankButtonBuy" id="bankGood-'+me.id+'_10" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',10)','this')+'>10</div>'+
						'<div class="bankButton bankButtonBuy" id="bankGood-'+me.id+'_100" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',100)','this')+'>100</div>'+
						'<div style="width:28px;" class="bankButton bankButtonBuy" id="bankGood-'+me.id+'_Max" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',10000)','this')+'>Max</div>'+
						'<br>'+
						'<div style="padding:3px 2px;width:22px;" class="bankSymbol">Sell</div>'+
						'<div class="bankButton bankButtonSell" id="bankGood-'+me.id+'_-1" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',-1)','this')+'>1</div>'+
						'<div class="bankButton bankButtonSell" id="bankGood-'+me.id+'_-10" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',-10)','this')+'>10</div>'+
						'<div class="bankButton bankButtonSell" id="bankGood-'+me.id+'_-100" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',-100)','this')+'>100</div>'+
						'<div style="width:28px;" class="bankButton bankButtonSell" id="bankGood-'+me.id+'_-All" '+Game.getDynamicTooltip('Game.ObjectsById['+M.parent.id+'].minigame.tradeTooltip('+me.id+',-10000)','this')+'>All</div>'+
					'</div>'+
				'</div>';
			}
			str+='</div>';
			str+='<div id="bankGraphBox"></div>';
			
		str+='</div>';
		div.innerHTML=str;
		
		
		
		var str='';
		str+='<div style="position:absolute;left:2px;top:2px;z-index:10;">'+
			'<div id="bankGraphLines" class="bankSimpleButton" style="background:rgba(0,0,0,0.5);padding:2px;border-radius:4px;">Line style</div>'+
			'<div id="bankGraphCols" class="bankSimpleButton" style="background:rgba(0,0,0,0.5);padding:2px;border-radius:4px;">Color mode</div>'+
			(Game.sesame?'<div id="bankCheatSpeed" class="bankSimpleButton" style="background:rgba(0,0,0,0.5);padding:2px;border-radius:4px;">Toggle speed</div>':'')+
		'</div>'+
		'<div style="font-family:Arial Black;font-weight:40px;letter-spacing:2px;opacity:0.15;font-weight:bold;position:absolute;left:6px;bottom:6px;z-index:10;pointer-events:none;">DOUGH JONES INDEX</div>';
		for (var i=0;i<M.goodsById.length;i++)
		{
			var me=M.goodsById[i];
			str+='<div id="bankGood-'+me.id+'-graphIcon" class="icon bankGraphIcon" style="pointer-events:none;transform:scale(0.5);background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div>';
		}
		l('bankGraphBox').innerHTML=str;
		
		var div=document.createElement('canvas');
		div.id='bankGraph';
		div.style.marginLeft='-14px';
		div.width=64;
		div.height=64;
		l('bankGraphBox').appendChild(div);
		M.graph=div;
		M.graphCtx=M.graph.getContext('2d',{alpha:false});
		
		AddEvent(l('bankGraphLines'),'click',function(e){
			if (M.graphLines==0) M.graphLines=1;
			else M.graphLines=0;
			M.toRedraw=2;
			PlaySound('snd/tick.mp3');
		});
		AddEvent(l('bankGraphCols'),'click',function(e){
			if (M.graphCols==0) M.graphCols=1;
			else M.graphCols=0;
			M.setCols();
			M.toRedraw=2;
			PlaySound('snd/tick.mp3');
		});
		if (l('bankCheatSpeed'))
		{
			AddEvent(l('bankCheatSpeed'),'click',function(e){
			if (M.secondsPerTick==60) M.secondsPerTick=1/10;
			else M.secondsPerTick=60;
			M.toRedraw=2;
			PlaySound('snd/tick.mp3');
			});
		}
		
		AddEvent(l('bankOfficeUpgrade'),'click',function(e){
			var me=M.offices[M.officeLevel];
			if (me.cost && Game.Objects['Cursor'].amount>=me.cost[0] && Game.Objects['Cursor'].level>=me.cost[1])
			{
				Game.Objects['Cursor'].sacrifice(me.cost[0]);
				M.officeLevel+=1;
				if (M.officeLevel>=M.offices.length-1) Game.Win('Pyramid scheme');
				PlaySound('snd/cashIn2.mp3',0.6);
				Game.SparkleOn(e.target);
			}
		});
		AddEvent(l('bankBrokersBuy'),'click',function(e){
			if (M.brokers<M.getMaxBrokers() && Game.cookies>=M.getBrokerPrice())
			{
				Game.Spend(M.getBrokerPrice());
				M.brokers+=1;
				PlaySound('snd/cashIn2.mp3',0.6);
				Game.SparkleOn(e.target);
			}
		});
		
		AddEvent(l('bankLoan1'),'click',function(e){
			if (M.takeLoan(1)) {PlaySound('snd/cashIn2.mp3',0.6);Game.SparkleOn(e.target);}
		});
		AddEvent(l('bankLoan2'),'click',function(e){
			if (M.takeLoan(2)) {PlaySound('snd/cashIn2.mp3',0.6);Game.SparkleOn(e.target);}
		});
		AddEvent(l('bankLoan3'),'click',function(e){
			if (M.takeLoan(3)) {PlaySound('snd/cashIn2.mp3',0.6);Game.SparkleOn(e.target);}
		});
		
		for (var i=0;i<M.goodsById.length;i++)
		{
			var me=M.goodsById[i];
			me.l=l('bankGood-'+me.id);
			me.symbolNumL=l('bankGood-'+me.id+'-sym');
			me.valL=l('bankGood-'+me.id+'-val');
			me.stockBoxL=l('bankGood-'+me.id+'-stockBox');
			me.stockL=l('bankGood-'+me.id+'-stock');
			me.stockMaxL=l('bankGood-'+me.id+'-stockMax');
			me.viewHideL=l('bankGood-'+me.id+'-viewHide');
			me.graphIconL=l('bankGood-'+me.id+'-graphIcon');
			
			AddEvent(l('bankGood-'+i),'mouseover',function(i){return function(e){
				if (M.hoverOnGood!=i) {M.hoverOnGood=i;M.toRedraw=2;}
			}}(i));
			AddEvent(l('bankGood-'+i),'mouseout',function(i){return function(e){
				if (M.hoverOnGood==i) {M.hoverOnGood=-1;M.toRedraw=2;}
			}}(i));
			
			AddEvent(l('bankGood-'+i+'-viewHide'),'click',function(i){return function(e){
				if (Game.keys[16])//solo with shift-click
				{
					var mode=M.goodsById[i].hidden;
					for (var ii=0;ii<M.goodsById.length;ii++)
					{
						if (ii==i) M.goodsById[ii].hidden=!mode;
						else if (!mode) M.goodsById[ii].hidden=false;
						else M.goodsById[ii].hidden=true;
						M.updateGoodStyle(ii);
					}
				}
				else
				{
					if (M.goodsById[i].hidden) M.goodsById[i].hidden=false;
					else M.goodsById[i].hidden=true;
					M.updateGoodStyle(i);
				}
				M.checkGraphScale();
				M.toRedraw=2;
				PlaySound('snd/tick.mp3');
			}}(i));
			
			AddEvent(l('bankGood-'+i+'_1'),'click',function(i){return function(e){
				if (M.buyGood(i,1)) Game.SparkleOn(e.target);
			}}(i));
			AddEvent(l('bankGood-'+i+'_-1'),'click',function(i){return function(e){
				if (M.sellGood(i,1)) Game.SparkleOn(e.target);
			}}(i));
			AddEvent(l('bankGood-'+i+'_10'),'click',function(i){return function(e){
				if (M.buyGood(i,10)) Game.SparkleOn(e.target);
			}}(i));
			AddEvent(l('bankGood-'+i+'_-10'),'click',function(i){return function(e){
				if (M.sellGood(i,10)) Game.SparkleOn(e.target);
			}}(i));
			AddEvent(l('bankGood-'+i+'_100'),'click',function(i){return function(e){
				if (M.buyGood(i,100)) Game.SparkleOn(e.target);
			}}(i));
			AddEvent(l('bankGood-'+i+'_-100'),'click',function(i){return function(e){
				if (M.sellGood(i,100)) Game.SparkleOn(e.target);
			}}(i));
			AddEvent(l('bankGood-'+i+'_Max'),'click',function(i){return function(e){
				if (M.buyGood(i,10000)) Game.SparkleOn(e.target);
			}}(i));
			AddEvent(l('bankGood-'+i+'_-All'),'click',function(i){return function(e){
				if (M.sellGood(i,10000)) Game.SparkleOn(e.target);
			}}(i));
		}
		
		
		
		AddEvent(M.graph,'mousemove',function(e){
			//get which graph line the mouse is over
			var x=e.layerX;
			var y=e.layerY;
			var width=M.graph.width;
			var height=M.graph.height;
			var span=Math.max(4,Math.ceil(width/65));//6;
			var isOnLine=-1;
			var rows=Math.ceil(width/span);
			bankGraphMouseDetect:
			for (var i=M.goodsById.length-1;i>=0;i--)
			{
				var id=i;
				var me=M.goodsById[id];
				if (me.hidden || !me.active) continue;
				for (var iR=0;iR<rows;iR++)
				{
					if (me.vals.length>=(2+iR))
					{
						var min=Math.max(me.vals[0+iR],me.vals[1+iR]);
						var max=Math.abs((me.vals[0+iR]-me.vals[1+iR]));
						if (x>=width-span*iR-span-2 && x<=width-span*iR+2 && y>=height-min*M.graphScale-6 && y<=height-min*M.graphScale+Math.max(3,max*M.graphScale)+6)
						{
							isOnLine=i;
							Game.tooltip.draw(0,'<div style="width:128px;font-size:10px;text-align:center;"><div class="icon" style="pointer-events:none;display:inline-block;transform:scale(0.5);margin:-16px -18px -16px -14px;vertical-align:middle;background-position:'+(-me.icon[0]*48)+'px '+(-me.icon[1]*48)+'px;"></div> <b>'+me.name+'</b><br>valued at <b>$'+Beautify(me.vals[0+iR],2)+'</b><br>'+Game.sayTime((iR+1)*M.secondsPerTick*Game.fps)+' ago</div>','top');
							break bankGraphMouseDetect;
						}
					}
				}
			}
			if (isOnLine!=M.hoverOnGood)
			{
				M.hoverOnGood=isOnLine;
				if (M.hoverOnGood!=-1)
				{
					M.graph.style.cursor='pointer';
				}
				else
				{
					M.graph.style.cursor='auto';
					Game.tooltip.shouldHide=1;
				}
				M.toRedraw=2;
			}
		});
		AddEvent(M.graph,'mouseout',function(e){
			M.graph.style.cursor='auto';
			if (M.hoverOnGood!=-1) {M.hoverOnGood=-1;M.toRedraw=2;}
			Game.tooltip.shouldHide=1;
		});
		
		M.reset();
	}
	M.onResize=function()
	{
		M.graph.width=l('bankContent').offsetWidth-22;
		M.graph.height=300;//l('bankContent').offsetHeight;
		var ctx=M.graphCtx;
		ctx.fillStyle='#fff';
		ctx.fillRect(0,0,M.graph.width,M.graph.height);
		M.checkGraphScale();
		M.toRedraw=2;
	}
	M.save=function()
	{
		//output cannot use ",", ";" or "|"
		var str=''+
		parseInt(M.officeLevel)+':'+
		parseInt(M.brokers)+':'+
		parseInt(M.graphLines)+':'+
		parseFloat(M.profit)+':'+
		parseInt(M.graphCols)+':'+
		' ';
		for (var iG=0;iG<M.goodsById.length;iG++)
		{
			var it=M.goodsById[iG];
			str+=parseInt(it.val*100)+':'+parseInt(it.mode)+':'+parseInt(it.d*100)+':'+parseInt(it.dur)+':'+parseInt(it.stock)+':'+parseInt(it.hidden?1:0)+':'+parseInt(it.last)+'!';
		}
		str+=' '+parseInt(M.parent.onMinigame?'1':'0');
		return str;
	}
	M.load=function(str)
	{
		//interpret str; called after .init
		//note : not actually called in the Game's load; see "minigameSave" in main.js
		if (!str) return false;
		var i=0;
		var spl=str.split(' ');
		var spl2=spl[i++].split(':');
		var i2=0;
		M.officeLevel=parseInt(spl2[i2++]||M.officeLevel);
		M.brokers=parseInt(spl2[i2++]||M.brokers);
		M.graphLines=parseInt(spl2[i2++]||M.graphLines);
		M.profit=parseFloat(spl2[i2++]||0);
		M.graphCols=parseInt(spl2[i2++]||M.graphCols);M.setCols();
		M.tickT=0;
		
		var goods=spl[i++].split('!');
		for (var iG=0;iG<M.goodsById.length;iG++)
		{
			if (!goods[iG]) continue;
			var it=M.goodsById[iG];
			var itData=goods[iG].split(':');
			it.val=parseInt(itData[0])/100;
			it.mode=parseInt(itData[1]);
			it.d=parseInt(itData[2])/100;
			it.vals=[it.val,it.val-it.d];
			it.dur=parseInt(itData[3]);
			it.stock=parseInt(itData[4]);
			it.hidden=parseInt(itData[5])?true:false;
			it.active=false;
			it.last=parseInt(itData[6]||0);
			if (it.building.highest>0) it.active=true;
			if (it.l) M.updateGoodStyle(it.id);
		}
		M.onResize();
		
		var on=parseInt(spl[i++]||0);if (on && Game.ascensionMode!=1) M.parent.switchMinigame(1);
	}
	M.reset=function(hard)
	{
		M.tickT=0;
		M.toRedraw=0;
		M.officeLevel=0;
		M.brokers=0;
		
		if (hard) {M.graphLines=1;M.graphCols=0;}M.setCols();
		M.hoverOnGood=-1;
		M.ticks=0;
		M.lastTickDrawn=0;
		M.profit=0;
		
		for (var i=0;i<M.goodsById.length;i++)
		{
			var it=M.goodsById[i];
			it.stock=0;
			it.mode=choose([0,1,1,2,2,3,4,5]);
			it.dur=Math.floor(10+Math.random()*990);
			it.val=M.getRestingVal(it.id);
			it.d=Math.random()*0.2-0.1;
			it.vals=[it.val,it.val-it.d];
			it.hidden=true;
			it.active=false;
			it.last=0;//0 : didn't buy or sell this tick; 1 : bought this tick; 2 : sold this tick
			if (it.l) M.updateGoodStyle(it.id);
		}
		M.onResize();
		for (var i=0;i<15;i++)
		{
			M.tick();
		}
	}
	
	M.profit=0;
	
	M.ticks=0;
	M.lastTickDrawn=0;
	M.secondsPerTick=60;//1 tick every minute
	M.tick=function()
	{
		for (var i=0;i<M.goodsById.length;i++)
		{
			var me=M.goodsById[i];
			me.last=0;
			
			me.d*=0.97;
			
			if (me.mode==0) {me.d*=0.95;me.d+=0.05*(Math.random()-0.5);}
			else if (me.mode==1) {me.d*=0.99;me.d+=0.05*(Math.random()-0.1);}
			else if (me.mode==2) {me.d*=0.99;me.d-=0.05*(Math.random()-0.1);}
			else if (me.mode==3) {me.d+=0.15*(Math.random()-0.1);me.val+=Math.random();}
			else if (me.mode==4) {me.d-=0.15*(Math.random()-0.1);me.val-=Math.random();}
			else if (me.mode==5) me.d+=0.3*(Math.random()-0.5);
			
			me.val+=(M.getRestingVal(me.id)-me.val)*0.02;
			me.val+=(Math.random()-0.5)*0.4;
			me.d+=0.1*(Math.random()-0.5);
			if (Math.random()<0.1) me.val+=(Math.random()-0.5)*3;
			if (Math.random()<0.1) me.d+=(Math.random()-0.5)*0.3;
			if (me.mode==5)
			{
				if (Math.random()<0.5) me.val+=(Math.random()-0.5)*10;
				if (Math.random()<0.2) me.d=(Math.random()-0.5)*2;
			}
			if (me.mode==3 && Math.random()<0.3) {me.d+=(Math.random()-0.5)*0.1;me.val+=(Math.random()-0.7)*10;}
			if (me.mode==3 && Math.random()<0.03) {me.mode=4;}
			if (me.mode==4 && Math.random()<0.3) {me.d+=(Math.random()-0.5)*0.1;me.val+=(Math.random()-0.3)*10;}
			
			if (me.val>(100+(Game.Objects['Bank'].level-1)*3) && me.d>0) me.d*=0.9;
			
			me.val+=me.d;
			/*if (me.val<=0 && me.d<0)
			{
				me.d*=0.75;
				if (me.mode==4 && Math.random()<0.05) me.mode=2;
			}
			if (me.val<2) me.val+=(2-me.val)*0.1;
			me.val=Math.max(me.val,0.01);*/
			/*var cutoff=5;
			var minvalue=1;
			if (me.val<=cutoff)
			{
				var s=Math.max(0,me.val)/cutoff;
				me.val=((2*minvalue-cutoff)*s+(2*cutoff-3*minvalue))*s*s+minvalue;//low soft-cap between 1 and 5
			}*/
			if (me.val<5) me.val+=(5-me.val)*0.5;
			if (me.val<5 && me.d<0) me.d*=0.95;
			me.val=Math.max(me.val,1);
			
			me.vals.unshift(me.val);
			if (me.vals.length>65) me.vals.pop();
			
			me.dur--;
			//if (Math.random()<1/me.dur)
			if (me.dur<=0)
			{
				me.dur=Math.floor(10+Math.random()*990);
				if (Math.random()<0.7 && (me.mode==3 || me.mode==4)) me.mode=5;
				else me.mode=choose([0,1,1,2,2,3,4,5]);
			}
		}
		M.checkGraphScale();
		M.toRedraw=Math.max(M.toRedraw,1);
		M.ticks++;
	}
	
	M.tickT=0;
	M.logic=function()
	{
		//run each frame
		
		M.tickT++;
		if (M.tickT>=Game.fps*M.secondsPerTick)
		{
			M.tickT=0;
			M.tick();
		}
		
		if (Game.T%10==0)
		{
			var doResize=false;
			for (var i=0;i<M.goodsById.length;i++)
			{
				var me=M.goodsById[i];
				
				if (!me.active && me.building.highest>0) {me.active=true;me.hidden=false;M.toRedraw=2;if (me.l){M.updateGoodStyle(me.id);doResize=true;}}
			}
			if (doResize) M.onResize();
		}
	}
	M.hoverOnGood=-1;
	M.graphScale=10;//how many units 1 vertical pixel represents
	M.graphLines=1;
	M.graphCols=0;
	M.checkGraphScale=function()
	{
		//check if the height of the graph and the highest good value
		//if the scale is too narrow to accommodate all goods, zoom out
		//if the scale is too wide, zoom back in (but with a higher margin)
		//this is done in increments of 50
		var currentSize=M.graph.height;
		if (!currentSize) return false;
		var maxVal=0;
		for (var i=0;i<M.goodsById.length;i++)
		{
			var me=M.goodsById[i];
			if (me.hidden) continue;
			//if (me.id==0) me.vals[0]=50+50*Math.sin(Date.now()*0.0002+me.id);
			for (var ii=0;ii<me.vals.length;ii++)
			{
				maxVal=Math.max(maxVal,me.vals[ii]);
			}
		}
		var neededSize=Math.max(maxVal,10)+10;
		var newScale=(Math.max(1,currentSize/neededSize));
		var dif=(currentSize/M.graphScale)/neededSize;
		var dif=(currentSize/M.graphScale)-neededSize;
		if (M.graphScale!=newScale && dif>5 || dif<-5)
		{
			M.graphScale=newScale;
			M.toRedraw=2;
		}
	}
	M.colBases=[
		{bg:'#fff',line1:'#eee',line2:'#ccc',low:'#ce2549',high:'#79c600',highlight:'#000'},
		{bg:'#1f2836',line1:'#273545',line2:'#384b61',low:'#3153a3',high:'#c4971a',highlight:'#a6abad'},
	];
	M.setCols=function()
	{
		if (!M.colBases[M.graphCols]) M.graphCols=0;
		M.cols=M.colBases[M.graphCols];
		if (l('bankGraphBox'))
		{
			l('bankGraphBox').style.backgroundColor=M.cols.bg;
			l('bankGraphBox').style.color=M.cols.highlight;
		}
		if (M.graph) M.graph.style.backgroundColor=M.cols.bg;
	}
	M.setCols();
	M.drawGraph=function(full)
	{
		/*
			what this does :
			scroll the graph left by (span)
			draw more graph data to the right
			if (full), do a full redraw instead
		*/
		var ctx=M.graphCtx;
		var width=M.graph.width;
		var span=Math.max(4,Math.ceil(width/65));//6;
		var height=M.graph.height;
		ctx.globalAlpha=1;
		if (!full) ctx.drawImage(M.graph,-span,0);
		ctx.fillStyle=M.cols.bg;
		if (full) ctx.fillRect(0,0,width,height);
		else ctx.fillRect(width-span,0,span,height);
		ctx.lineWidth=2;
		ctx.globalAlpha=1;
		
		var rows=(full?Math.ceil(width/span):1);
		
		for (var i=0;i<height/M.graphScale;i+=2)//horizontal lines (1 every 2 units)
		{
			if (i%10!=0) ctx.fillStyle=M.cols.line1; else ctx.fillStyle=M.cols.line2;
			ctx.fillRect(width-span*rows,height-Math.floor(i*M.graphScale),span*rows,1);
		}
		for (var iR=0;iR<rows;iR++)//vertical lines (1 every 10 ticks)
		{
			if ((iR-M.ticks)%10!=0) continue;
			if ((iR-M.ticks)%60!=0) ctx.fillStyle=M.cols.line1; else ctx.fillStyle=M.cols.line2;
			ctx.fillRect(width-span*iR-1,0,1,height);
		}
		for (var i=0;i<M.goodsById.length+1;i++)
		{
			//some trickery going on here to always display the M.hoverOnGood bars above the others
			var id=i;
			if (i==M.goodsById.length) id=M.hoverOnGood;
			else if (i==M.hoverOnGood) continue;
			if (id==-1) continue;
			var me=M.goodsById[id];
			if (me.hidden || !me.active) continue;
			for (var iR=0;iR<rows;iR++)
			{
				if (me.vals.length>=(2+iR))
				{
					var delta=M.goodDelta(me.id,iR);
					
					if (M.graphLines==0)
					{
						var min=Math.max(me.vals[0+iR],me.vals[1+iR]);
						var max=Math.abs((me.vals[0+iR]-me.vals[1+iR]));
						var min2=Math.abs(Math.sin((M.ticks-iR)*11+id*137))*max*2;
						var max2=min2+Math.abs(Math.sin((M.ticks-iR)*13+id*139))*max*2;
						if (M.hoverOnGood==id)
						{
							ctx.fillStyle=M.cols.highlight;
							ctx.fillRect(width-span*iR-span-1,Math.floor(height-min*M.graphScale)-1,span+1,Math.max(3,Math.ceil(max*M.graphScale))+2);
						}
						ctx.fillStyle=delta>0?M.cols.high:M.cols.low;
						ctx.fillRect(width-span*iR-span,Math.floor(height-min*M.graphScale),span-1,Math.max(3,Math.ceil(max*M.graphScale)));
						ctx.fillRect(width-span*iR-span/2-1,Math.floor(height-(min+min2)*M.graphScale),1,Math.max(3,Math.ceil((max+max2)*M.graphScale)));
					}
					else
					{
						if (M.hoverOnGood==id)
						{
							ctx.lineWidth=4;
							ctx.strokeStyle=M.cols.highlight;
							ctx.beginPath();
							ctx.moveTo(width-span*iR-span-1,Math.floor(height-me.vals[1+iR]*M.graphScale)+0.5);
							ctx.lineTo(width-span*iR-1,Math.floor(height-me.vals[0+iR]*M.graphScale)+0.5);
							ctx.stroke();
							ctx.lineWidth=2;
						}
						ctx.strokeStyle=delta>0?M.cols.high:M.cols.low;
						ctx.beginPath();
						ctx.moveTo(width-span*iR-span-1,Math.floor(height-me.vals[1+iR]*M.graphScale)+0.5);
						ctx.lineTo(width-span*iR-1,Math.floor(height-me.vals[0+iR]*M.graphScale)+0.5);
						ctx.stroke();
					}
				}
			}
		}
	}
	M.draw=function()
	{
		//run each draw frame
		
		if (Game.drawT%2==0 && M.toRedraw>0 && M.graph && M.graphCtx)
		{
			if (M.lastTickDrawn<M.ticks-1) M.toRedraw=2;
			M.lastTickDrawn=M.ticks;
			M.drawGraph(M.toRedraw==2?true:false);
			
			for (var i=0;i<M.goodsById.length;i++)
			{
				var me=M.goodsById[i];
				var val=M.goodDelta(me.id);
				me.symbolNumL.innerHTML=val+''+(val==Math.floor(val)?'.00':(val*10)==Math.floor(val*10)?'0':'')+'%'/*+', '+['stable','slow rise','slow fall','fast rise','fast fall','chaotic'][me.mode]*/;
				if (val>=0) {me.symbolNumL.classList.add('bankSymbolUp');me.symbolNumL.classList.remove('bankSymbolDown');}
				else if (val<0) {me.symbolNumL.classList.remove('bankSymbolUp');me.symbolNumL.classList.add('bankSymbolDown');}
				else {me.symbolNumL.classList.remove('bankSymbolUp');me.symbolNumL.classList.remove('bankSymbolDown');}
				
				me.valL.innerHTML='$'+Beautify(me.val,2);
				me.stockL.innerHTML=Beautify(me.stock);
				//if (me.stock>0) me.stockL.style.color='#fff';
				//else me.stockL.style.removeProperty('color');
				if (me.stock>0) me.stockBoxL.classList.add('green');
				else me.stockBoxL.classList.remove('green');
				me.stockMaxL.innerHTML='/'+Beautify(M.getGoodMaxStock(me));
				
				me.graphIconL.style.transform='translate(-8px,'+Math.floor((M.graph.height-me.vals[0]*M.graphScale))+'px) scale(0.5)';
			}
			M.toRedraw=0;
		}
		if (Game.drawT%10==0)
		{
			var office=M.offices[M.officeLevel];
			l('bankOfficeIcon').style.backgroundPosition=(-office.icon[0]*48)+'px '+(-office.icon[1]*48)+'px';
			l('bankOfficeName').innerHTML=office.name;
			l('bankOfficeUpgrade').innerHTML='Upgrade ('+office.cost[0]+' cursors)';
			if (!office.cost) l('bankOfficeUpgrade').style.display='none';
			else
			{
				l('bankOfficeUpgrade').style.removeProperty('display');
				if (Game.Objects['Cursor'].amount>=office.cost[0] && Game.Objects['Cursor'].level>=office.cost[1]) l('bankOfficeUpgrade').classList.remove('bankButtonOff');
				else l('bankOfficeUpgrade').classList.add('bankButtonOff');
			}
			l('bankBrokersText').innerHTML=M.brokers==0?'no brokers':M.brokers==1?'1 broker':(M.brokers+' brokers');
			if (M.brokers<M.getMaxBrokers() && Game.cookies>=M.getBrokerPrice()) l('bankBrokersBuy').classList.remove('bankButtonOff');
			else l('bankBrokersBuy').classList.add('bankButtonOff');
			
			if (M.officeLevel<=1) l('bankLoan1').style.display='none';
			else l('bankLoan1').style.removeProperty('display');
			if (M.officeLevel<=3) l('bankLoan2').style.display='none';
			else l('bankLoan2').style.removeProperty('display');
			if (M.officeLevel<=4) l('bankLoan3').style.display='none';
			else l('bankLoan3').style.removeProperty('display');
			
			for (var id=1;id<4;id++)
			{
				if (Game.hasBuff('Loan '+id) || Game.hasBuff('Loan '+id+' (interest)')) l('bankLoan'+id).classList.add('bankButtonOff');
				else l('bankLoan'+id).classList.remove('bankButtonOff');
			}
			
			var it=l('bankBalance');
			it.innerHTML=(M.profit<0?'-':'')+'$'+Beautify(Math.abs(M.profit),2);
			if (M.profit>0) {it.classList.add('bankSymbolUp');it.classList.remove('bankSymbolDown');}
			else if (M.profit<0) {it.classList.add('bankSymbolDown');it.classList.remove('bankSymbolUp');}
			
			l('bankNextTick').innerHTML='Next tick in '+Game.sayTime((Game.fps*M.secondsPerTick)-M.tickT+30,-1)+'.';
		}
	}
	M.init(l('rowSpecial'+M.parent.id));
}
var M=0;