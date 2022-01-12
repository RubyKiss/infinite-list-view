
//viewport 可视区域
//scrollcontainer 滚动的块
//dataList 数据列表
//renderFunction 渲染函数(index,item,lastnode)
//返回 数据列表（包含_update函数，动态添加了数据需要刷新页面时用的）
//滚动的块
function infListView(viewPort, scrollcontainer, contentcontainer, dataList, renderFunction, itemDefHeight) { //viewPort,scrollcontainer

    var _item_height = itemDefHeight || 80;
    var _render = renderFunction || function (i, v, d) { };
    var _render_len = 10;
    var _list = dataList;
    var _listHeightList = [];

    var _viewport = viewPort;
    var _container = scrollcontainer;
    var _content = contentcontainer;
    // var _viewport = document.createElement('div');
    // var _container = document.createElement('div');
    // var _content = document.createElement('div');

    var _last_render_child_list = [];

    function get_draw_list(scrollY) {
        var pxtop = 0
        var x = []
        var index = []
        for (var i = 0; i < _list.length; i++) {
            var h = 0
            if (_listHeightList[i]) {
                h = _listHeightList[i]
            } else {
                h = _item_height
            }
            pxtop += h

            if (pxtop >= scrollY) {
                
                if (x.length < _render_len) {
                    x.push(_list[i])
                    index.push(i)
                }
            }
        }
        return [x, index]
    }

    function set_content_top(top) {
        _container.style.position = "relative"
        _content.style.position = "absolute"
        _content.style.width = "100%"
        _content.style.top = top + "px"
    }

    //获取某个index的top的
    function get_index_top(index) {
        var pxtop = 0
        for (var i = 0; i < _list.length; i++) {
            if (i < index) {
                if (_listHeightList[i]) {
                    pxtop += _listHeightList[i]
                } else {
                    pxtop += _item_height
                }
            } else {
                break
            }
        }
        return pxtop
    }
    function get_max_height() {
        var t = get_index_top(_list.length - 1)
        if (_listHeightList[_list.length - 1] != undefined) {
            t += _listHeightList[_list.length - 1]
        } else {
            t += _item_height
        }
        return t
    }
    function hide_node(index) {
        _content.children[index].style.display = "none"
    }
    function show_node(index) {
        _content.children[index].style.display = ""
    }

    function find_free_hide_node() {
        var x = []
        for (var i = 0; i < _content.children.length; i++){
            if (_content.children[i]._index == -1) {
                x.push(_content.children[i])
            }
        }
        return x
    }


    function update(init) {
        var drawitem = get_draw_list(viewPort.scrollTop)
        var data_list = drawitem[0]
        var data_index_list = drawitem[1]

        var top = get_index_top(data_index_list[0])
        set_content_top(top)
        if (init) {
            for (var i = 0; i < _render_len; i++) {
                if (i > data_list.length - 1) {
                    //插入空白DIV
                    var div = document.createElement("div")
                    div._index = data_index_list[i]
                    div.style.display = "none"
                    div.style.minHeight=(_listHeightList[div._index] ? _listHeightList[div._index] : _item_height) +"px"
                    _content.append(div)
                    continue;
                }
                var dom = _render(data_index_list[i], data_list[i], null)
                dom._index = data_index_list[i]
                dom.style.minHeight=(_listHeightList[dom._index] ? _listHeightList[dom._index] : _item_height) +"px"
                _content.append(dom)
            }
        } else {

            //更新前
            var insert = false
            for (var i = 0; i < data_list.length; i++) {
                var curnewindex = data_index_list[i]
                if (_last_render_child_list[curnewindex] == undefined) {
                    if (i == 0) {
                        //一开始插入
                        insert = true
                        break
                    } else if (i > 0) {
                        //末尾开始插入
                        insert = false
                        break
                    }
                }
            }
            //闲置
            var poplist = []
            var allin=true
            for (var n in _last_render_child_list) {
                if (data_index_list.indexOf(n * 1) == -1) {
                    poplist.push(_last_render_child_list[n])
                    allin=false
                }
            }
            if (poplist.length == 0) {
                //另外一种情况闲置，2个数组长度不一样且都有值并且 _last_render_child_list 的key都在data_index_list 列表中出现
                if (_last_render_child_list.length != data_index_list.length && _last_render_child_list.length > 0 && data_index_list.length > 0 && allin == true) {
                    var lastkeylist = Object.keys(_last_render_child_list).join('-')
                    // console.log(lastkeylist,'=====',data_index_list.join('-'))
                    var freelist = find_free_hide_node()
                    for (var i = 0; i < data_index_list.length; i++){
                        if (lastkeylist.search(data_index_list[i]+'') == -1) {
                            if (freelist.length) {
                                poplist.push(freelist.pop())
                                console.log('test!!!!',i)
                            } else {
                                break
                            }
                        }
                    }
                }
            }

            // console.log(Object.keys(_last_render_child_list).join(','),'-----',data_index_list.join(','))

            var insertindex = -1
            if (insert) {
                for (var i = 0; i < data_list.length; i++) {
                    var curnewindex = data_index_list[i]
                    if (_last_render_child_list[curnewindex] != undefined) {
                        insertindex = i - 1
                        break
                    }
                }
            }

            if (poplist.length > 0) {
                var firstchild = _content.children[insertindex]
                // console.log('poplen=' + poplist.length, 'insertbefore=', firstchild)
                var l1 = poplist.length


                for (var i = 0; i < l1; i++) {
                    var popx = poplist.pop()
                    // console.log('insert',insert)
                    if (insert) {
                        var insertccc = _content.insertBefore(popx, firstchild)
                        if (insertccc) {
                            // console.log('插入成功!')
                        } else {
                            // console.log('插入失败!')
                        }
                    } else {
                        _content.append(popx)
                    }
                }
            }


            var log = 0
            var loglist = []
            for (var i = 0; i < _render_len; i++) {
                var cur  =_content.children[i]
                if (i > data_list.length - 1) {
                    hide_node(i)
                    cur._index=-1
                    continue;
                } else {
                    show_node(i)

                    if (data_index_list[i] != cur._index) {
                        loglist.push(data_index_list[i] + " != " + cur._index)
                        cur._index = data_index_list[i]
                        cur.style.minHeight = (_listHeightList[cur._index] ? _listHeightList[cur._index] : _item_height) +"px"
                            
                        _render(data_index_list[i], data_list[i], _content.children[i])
                        log = log + 1
                    }

                }
            }
            if (log > 0) {
                // console.log('update=', log, '---', loglist)
                // debugger;
            }
        }
        //记录每次渲染的项对应的child
        _last_render_child_list = []
        for (var i = 0; i < _render_len; i++) {
            if (i > data_list.length - 1) {

            } else {

                _last_render_child_list[data_index_list[i]] = _content.children[i]

                var imglist = _content.children[i].querySelectorAll("img")
                var oklist = []
                if (imglist.length <= 0) {
                    _listHeightList[data_index_list[i]] = _content.children[i].offsetHeight
                } else {
                    //图片内容执行onload后设置高度
                    for (var j = 0; j < imglist.length; j++){
                        imglist[j]._pindex=data_index_list[i]
                        imglist[j]._pindex2=i
                        imglist[j]._maximglen = imglist.length
                        imglist[j]._oklist=oklist
                        imglist[j].onload = function () {
                            this._oklist.push(1)
                            if (this._oklist.length == this._maximglen) {
                                //清空
                                this._oklist = []
                                _listHeightList[this._pindex]=_content.children[this._pindex2].offsetHeight
                            }
                            console.log('setimg height')
                        }
                        imglist[j].onerror = function () { 
                            this._oklist.push(1)
                            if (this._oklist.length == this._maximglen) {
                                //清空
                                this._oklist = []
                                _listHeightList[this._pindex]=_content.children[this._pindex2].offsetHeight
                            }
                        }
                    }
                }

            }
        }
        _container.style.height = get_max_height() + "px"
    }

    //interface user api
    function updateItemByChildIndex(index) {
        _listHeightList[_content.children[index]._index]=_content.children[i].offsetHeight
    }
    function updateItemList() {
        for (var i = 0; i < _content.children.length; i++){
            _listHeightList[_content.children[i]._index]=_content.children[i].offsetHeight
        }
    }
    function updateRender() {
        update(false)
    }

    _list._updateRender=updateRender
    _list._updateItemList=updateItemList
    _list._updateItemByChildIndex=updateItemByChildIndex
    //end


    _viewport.addEventListener('scroll', () => {
        update(false)
    })
    update(true)
    return _list
}