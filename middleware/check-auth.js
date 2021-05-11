module.exports = (req, res, next) => {
    if (!req.session.wallet) {
        req.flash('error', 'Need to access wallet first!');
        return res.redirect('/');
    }

    next();
}