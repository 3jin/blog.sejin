import React, {Component} from 'react';
import {connect} from 'react-redux';
import scrollToComponent from 'react-scroll-to-component';
import * as actions from '../../../../actions';
import NoPostPreview from '../NoPostPreview';
import LoadingView from '../../LoadingView';
import BlogPreview from './BlogPreview';
import {getMenuHeight} from "../../../../utils/unitConverter";


class BlogContents extends Component {
    constructor(props) {
        super(props);
        this.contentPosition = null;
    }

    componentWillMount() {
        this.props.handleChangeMenu(2);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.menuActionType === 'CHANGE_MENU_FINISHED' && this.props.menuActionType !== nextProps.menuActionType) {
            const belongToMajor = this.props.menuList[2].title;
            const belongToMinor = this.props.menuList[2].submenuList[this.props.selectedSubmenuIdx].title;
            this.props.handleFetchPosts(
                '/posts',
                belongToMajor,
                belongToMinor,
            );
        }
        if (nextProps.scroll) {
            switch (nextProps.menuActionType) {
                case 'CHANGE_MENU':
                    if (nextProps.scroll) {
                        // TODO: It needs deceleration effect.
                        (function scrollToTop() {
                            if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
                                window.scrollBy(0, -50);
                                setTimeout(scrollToTop, 10);
                            }
                        }());
                    }
                    break;
                case 'CHANGE_SUBMENU':
                    scrollToComponent(
                        this.contentPosition,
                        {
                            align: 'top',
                            duration: 500,
                            offset: -getMenuHeight(),
                        }
                    );
                    // // TODO: It needs deceleration effect.
                    // (function scrollToTop() {
                    //     if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
                    //         window.scrollBy(0, -50);
                    //         setTimeout(scrollToTop, 10);
                    //     }
                    // }());
                    break;
            }

            this.props.handleScrollToComponentFinished();
        }
    }

    shouldComponentUpdate(nextProps) {
        return (
            (nextProps.postPayload.length > 0) ||
            (nextProps.tagPayload.length > 0) ||
            (this.props.loading !== nextProps.loading)
        );
    }

    render() {
        const renderLoading = () => {
            return (
                <LoadingView isTable={true}/>
            );
        };

        const renderContents = (postList, tagList) => {
            if (postList.length === 0) {
                return <NoPostPreview/>
            }
            return postList.map((post) => {
                return <BlogPreview
                    key={post._id}
                    id={post._id}
                    belongToMajor={post.belongToMajor}
                    belongToMinor={post.belongToMinor}
                    title={post.title}
                    tags={tagList}
                    content={post.content}
                    dataUpdated={post.dataUpdated}
                    onReadMore={this.props.handleFetchPost}
                />
            });
        };

        return (
            <div className="content">
                <div>
                    <table>
                        <tbody ref={(section) => {
                            this.contentPosition = section;
                        }}>
                        {(this.props.loading || this.props.areTagsLoading) &&
                        renderLoading()
                        }
                        {!(this.props.loading || this.props.areTagsLoading) &&
                        renderContents(this.props.postPayload, this.props.tagPayload)
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        postPayload: state.posts.postPayload,
        loading: state.posts.loading,
        tagPayload: state.posts.tagPayload,
        menuActionType: state.menus.menuActionType,
        menuList: state.menus.menuList,
        // selectedMenuIdx: state.menus.selectedMenuIdx,
        selectedSubmenuIdx: state.menus.selectedSubmenuIdx,
        scroll: state.menus.scroll,
    }),
    (dispatch) => ({
        handleFetchPosts: (url, belongToMajor, belongToMinor) => {
            const pendedPostResult = dispatch(actions.fetchPosts(url, belongToMajor, belongToMinor));
            pendedPostResult.postPayload
                .then((postPayload) => {
                    // dispatch(actions.fetchSuccess(postPayload));
                    const pendedTagResult = dispatch(actions.fetchTags('/tags', belongToMinor));
                    pendedTagResult.tagPayload
                        .then((tagPayload) => {
                            dispatch(actions.fetchSuccess(postPayload, tagPayload));
                        })
                });
        },
        handleFetchPost: (url, postID) => {
            const pendedResult = dispatch(actions.fetchPost(url, postID));
            pendedResult.postPayload
                .then((response) => {
                    dispatch(actions.fetchSuccess(response));
                });
        },
        handleFetchTags: (url, belongToMinor) => {
            const pendedTagResult = dispatch(actions.fetchTags(url, belongToMinor));
            pendedTagResult.tagPayload
                .then((response) => {
                    dispatch(actions.fetchTagSuccess(response));
                });
        },
        handleScrollToComponentFinished: () => dispatch(actions.changeMenuFinished()),
        handleChangeMenu: (menuIdx) => dispatch(actions.changeMenu(menuIdx)),
    }),
)(BlogContents);