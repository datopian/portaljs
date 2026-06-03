import gql from 'graphql-tag';

export const GET_RESOURCE_VIEWS = gql`
  query views($id: String) {
    views(id: $id) @rest(type: "Response", path: "resource_view_list?{args}") {
      result @type(name: "View") {
        id
        title
        description
        resources: resource_id
        viewType: view_type
        series
        group
        type: graph_type
      }
    }
  }
`;

export const GET_DATASTORE_DATA = gql`
  query datastore($resource_id: String) {
    datastore(resource_id: $resource_id)
      @rest(type: "Response", path: "datastore_search?{args}") {
      result {
        count: total
        fields
        records
      }
    }
  }
`;

export const GET_ORG_QUERY = gql`
  query org($id: String) {
    org(id: $id) @rest(type: "Response", path: "organization_show?{args}") {
      result {
        name
        title
        description
        image: image_url
        created
        total: package_count
        users
        followers: num_followers
      }
    }
  }
`;

export const GET_DATASET_QUERY = gql`
  query dataset($id: String) {
    dataset(id: $id) @rest(type: "Response", path: "package_show?{args}") {
      result {
        name
        title
        size
        created: metadata_created
        updated: metadata_modified
        resources {
          id
          name
          title
          description
          path: url
          format
          created
          updated: last_modified
          size
        }
        organization {
          name
          title
          image: image_url
        }
      }
    }
  }
`;

export const SEARCH_QUERY = gql`
  query search($q: String, $sort: String, $rows: Int, $start: Int) {
    search(q: $q, sort: $sort, rows: $rows, start: $start)
      @rest(type: "Search", path: "package_search?{args}") {
      result {
        count
        results {
          name
          title
          updated: metadata_modified
          organization {
            name
            title
            description
            image: image_url
          }
        }
      }
    }
  }
`;

export const GET_TOTAL_COUNT_QUERY = gql`
  query search($q: String, $sort: String) {
    search(q: $q, sort: $sort)
      @rest(type: "Search", path: "package_search?{args}") {
      result {
        count
      }
    }
  }
`;

export const GET_STATS_QUERY = gql`
  query stats {
    datasets @rest(type: "Search", path: "package_search?rows=0") {
      result {
        count
      }
    }
    orgs @rest(type: "Search", path: "organization_list") {
      result
    }
    groups @rest(type: "Search", path: "group_list") {
      result
    }
  }
`;

export const GET_POSTS_QUERY = gql`
  query posts {
    posts @rest(type: "Posts", path: "", endpoint: "wordpress-posts") {
      found
      posts
      meta
    }
  }
`;

export const GET_PAGE_QUERY = gql`
  query page($slug: String) {
    page(slug: $slug)
      @rest(type: "Page", path: "{args.slug}", endpoint: "wordpress") {
      title
      content
      excerpt
      slug
      date
      modified
      featured_image
    }
  }
`;

export const GET_POST_QUERY = gql`
  query post($slug: String) {
    post(slug: $slug)
      @rest(type: "Post", path: "{args.slug}", endpoint: "wordpress") {
      title
      content
      excerpt
      slug
      date
      modified
    }
  }
`;
