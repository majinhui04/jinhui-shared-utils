/**
 * [toast 弹窗]
 * @param  {String} text     内容
 * @param  {Number} duration 延迟
 * @return
 */
function toast(text, duration) {
    if (toast.busy) return;
    toast.busy = true;
    duration = duration || 2500;
    setTimeout(function () {
        toast.busy = false;
    }, duration);

    let div = document.createElement('div');

    Object.assign(div.style, {
        padding: '5px 10px',
        color: '#fff',
        fontSize: '12px',
        lineHeight: 2,
        position: 'fixed',
        top: '50%',
        margin: '-100px auto 0',
        left: 0,
        right: 0,
        width: '150px',
        textAlign: 'center',
        borderRadius: '5px',
        zIndex: 99999,
        background: 'rgba(0,0,0,0.7)'
    });
    div.classList.add('toast');
    div.textContent = text;
    document.body.appendChild(div);

    setTimeout(function () {
        div.parentNode && div.parentNode.removeChild(div);
    }, duration);
}
