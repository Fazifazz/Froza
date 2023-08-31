exports.isAuthed = (req, res, next) => {
    if (req.session.user) {
        req.user = req.session.user
        next()
    } else {
        res.redirect('/login')
    }
}

exports.isNotAuthed = (req, res, next) => {
    if (!req.session.user) {
        next()
    } else {
        res.redirect('/')
    }
}