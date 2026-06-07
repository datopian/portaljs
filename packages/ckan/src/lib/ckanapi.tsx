/* eslint-disable jsx-a11y/anchor-is-valid */
import CkanRequest from '@portaljs/ckan-api-client-js';
import type { CkanResponse } from '@portaljs/ckan-api-client-js';
import { Activity } from '../interfaces/activity.interface';
import {
  Dataset,
  DatasetListQueryOptions,
  PackageSearchOptions,
  Resource,
  Tag,
} from '../interfaces/dataset.interface';
import { ResourceInfo, TableMetadata } from '../interfaces/datastore.interface';
import { Group } from '../interfaces/group.interface';
import { Organization } from '../interfaces/organization.interface';
import { User } from '../interfaces/user.interface';

export default class CKAN {
  DMS: string;

  constructor(DMS: string) {
    this.DMS = DMS;
  }

  /**
   * Wraps `CkanRequest.get` to preserve the retry-on-failure behaviour that the
   * old hand-rolled `fetchRetry` helper provided. `CkanRequest` throws a
   * `CkanRequestError` on a non-ok response, so a retry is a catch + re-attempt.
   *
   * NOTE: the previous `fetchRetry` also imposed a 30s abort timeout and let
   * callers pass extra `RequestInit` options (used by `packageSearch`).
   * `CkanRequest` does not expose `fetch` init / abort signals, so that specific
   * concern is no longer applied. See the consolidation report for details.
   */
  private async ckanGet<T>(action: string, retries = 0): Promise<CkanResponse<T>> {
    try {
      return await CkanRequest.get<CkanResponse<T>>(action, {
        ckanUrl: this.DMS,
      });
    } catch (e) {
      if (retries > 0) {
        return await this.ckanGet<T>(action, retries - 1);
      }
      throw e;
    }
  }

  async getDatasetsList() {
    const responseData = await this.ckanGet<Array<string>>('package_list', 3);
    return responseData.result;
  }

  async getDatasetsListWithDetails(options: DatasetListQueryOptions) {
    const responseData = await this.ckanGet<Array<Dataset>>(
      `current_package_list_with_resources?offset=${options.offset}&limit=${options.limit}`,
      3
    );
    const datasets: Array<Dataset> = responseData.result;
    return datasets;
  }

  async packageSearch(
    options: PackageSearchOptions,
    // NOTE: kept for signature compatibility. The previous implementation
    // forwarded these to `fetch`; `CkanRequest` does not accept `RequestInit`
    // options, so they are no longer applied. See the consolidation report.
    reqOptions: Partial<RequestInit> = {}
  ): Promise<{ datasets: Dataset[]; count: number }> {
    void reqOptions;
    function buildGroupsQuery(groups: Array<string>) {
      if (groups.length > 0) {
        return `groups:(${groups.join(' OR ')})`;
      }
      return '';
    }
    function buildOrgsQuery(orgs: Array<string>) {
      if (orgs.length > 0) {
        return `organization:(${orgs.join(' OR ')})`;
      }
      return '';
    }
    function buildTagsQuery(tags: Array<string>) {
      if (tags.length > 0) {
        return `tags:(${tags.join(' OR ')})`;
      }
      return '';
    }

    function buildResFormatQuery(resFormat: Array<string>) {
      if (resFormat?.length > 0) {
        return `res_format:(${resFormat.join(' OR ')})`;
      }
      return '';
    }

    function buildFq(
      tags: Array<string>,
      orgs: Array<string>,
      groups: Array<string>,
      resFormat: Array<string>
    ) {
      //TODO; this query builder is not very robust
      // convertToCkanSearchQuery function should be
      //copied over from the old portals utils
      const fq = [
        buildGroupsQuery(groups),
        buildOrgsQuery(orgs),
        buildTagsQuery(tags),
        buildResFormatQuery(resFormat),
      ].filter((str) => str !== '');
      if (fq.length > 0) {
        return '&fq=' + fq.join('+');
      }
      return null;
    }

    const fq = buildFq(
      options.tags,
      options.orgs,
      options.groups,
      options?.resFormat
    );

    let action = `package_search?`;
    action += `start=${options.offset}`;
    action += `&rows=${options.limit}`;
    action += fq ? fq : '';
    action += options.query ? '&q=' + options.query : '';
    action += options.sort ? '&sort=' + options.sort : '';
    action += options.include_private
      ? '&include_private=' + options.include_private
      : '';

    const responseData = await this.ckanGet<{
      results: Array<Dataset>;
      count: number;
    }>(action, 3);
    const datasets: Array<Dataset> = responseData.result.results;
    return { datasets, count: responseData.result.count };
  }

  async getDatasetDetails(datasetName: string) {
    let responseData: CkanResponse<Dataset>;
    try {
      responseData = await this.ckanGet<Dataset>(
        `package_show?id=${datasetName}`,
        1
      );
    } catch {
      throw 'Could not find dataset';
    }
    if (responseData.success === false) {
      throw 'Could not find dataset';
    }
    const dataset: Dataset = responseData.result;
    return dataset;
  }

  async getDatasetActivityStream(datasetName: string) {
    const responseData = await this.ckanGet<Array<Activity>>(
      `package_activity_list?id=${datasetName}`,
      3
    );
    const activitiesWithoutUserData: Array<Activity> = responseData.result;
    const activities = await Promise.all(
      activitiesWithoutUserData.map(async (item) => {
        let user_data: User | null = await this.getUser(item.user_id);
        user_data = user_data === undefined ? null : user_data;
        return { ...item, user_data };
      })
    );
    return activities;
  }

  async getUser(userId: string) {
    try {
      const responseData = await this.ckanGet<User>(
        `user_show?id=${userId}`,
        3
      );
      const user: User | null =
        responseData.success === true ? responseData.result : null;
      return user;
    } catch {
      return null;
    }
  }

  async getGroupList() {
    const responseData = await this.ckanGet<Array<string>>('group_list', 3);
    const groups: Array<string> = responseData.result;
    return groups;
  }

  async getGroupsWithDetails() {
    const responseData = await this.ckanGet<Array<Group>>(
      'group_list?all_fields=True',
      3
    );
    const groups: Array<Group> = responseData.result;
    return groups;
  }

  async getGroupDetails(groupName: string) {
    const responseData = await this.ckanGet<Group>(
      `group_show?id=${groupName}&include_datasets=True`,
      3
    );
    const group: Group = responseData.result;
    return group;
  }

  async getGroupActivityStream(groupName: string) {
    const responseData = await this.ckanGet<Array<Activity>>(
      `group_activity_list?id=${groupName}`,
      3
    );
    const activitiesWithoutUserData: Array<Activity> = responseData.result;
    const activities = await Promise.all(
      activitiesWithoutUserData.map(async (item) => {
        const user_data = await this.getUser(item.user_id);
        return { ...item, user_data };
      })
    );
    return activities;
  }

  async getOrgList() {
    const responseData = await this.ckanGet<Array<string>>(
      'organization_list',
      3
    );
    const organizations: Array<string> = responseData.result;
    return organizations;
  }

  async getOrgsWithDetails(accrossPages?: boolean) {
    if (!accrossPages) {
      const responseData = await this.ckanGet<Array<Organization>>(
        'organization_list?all_fields=True',
        3
      );
      const organizations: Array<Organization> = responseData.result;
      return organizations;
    }

    const organizations = [];
    const orgList = await this.ckanGet<Array<Organization>>(
      'organization_list',
      3
    );
    const orgLen = orgList.result.length;
    const pages = Math.ceil(orgLen / 25);

    for (let i = 0; i < pages; i++) {
      const responseData = await this.ckanGet<Array<Organization>>(
        `organization_list?all_fields=True&offset=${i * 25}&limit=25`,
        3
      );
      const result: Array<Organization> = responseData.result;
      organizations.push(...result);
    }
    return organizations.sort((a, b) => b.package_count - a.package_count);
  }

  async getOrgDetails(orgName: string) {
    const responseData = await this.ckanGet<Organization>(
      `organization_show?id=${orgName}&include_datasets=True`,
      3
    );
    const organization: Organization = responseData.result;
    return organization;
  }

  async getOrgActivityStream(orgName: string) {
    const responseData = await this.ckanGet<Array<Activity>>(
      `organization_activity_list?id=${orgName}`,
      3
    );
    const activitiesWithoutUserData: Array<Activity> = responseData.result;
    const activities = await Promise.all(
      activitiesWithoutUserData.map(async (item) => {
        const user_data = await this.getUser(item.user_id);
        return { ...item, user_data };
      })
    );
    return activities;
  }

  async getAllTags() {
    const responseData = await this.ckanGet<Array<Tag>>(
      'tag_list?all_fields=True',
      3
    );
    const tags: Array<Tag> = responseData.result;
    return tags;
  }

  async getResourcesWithAliasList() {
    const responseData = await CkanRequest.post<
      CkanResponse<{ records: Array<TableMetadata> }>
    >('datastore_search', {
      ckanUrl: this.DMS,
      json: {
        id: '_table_metadata',
        limit: '32000',
      },
    });
    const tableMetadata: Array<TableMetadata> = responseData.result.records;
    return tableMetadata.filter((item) => item.alias_of);
  }

  async datastoreSearch(resourceId: string) {
    const responseData = await CkanRequest.post<
      CkanResponse<{ records: Array<any> }>
    >('datastore_search', {
      ckanUrl: this.DMS,
      json: {
        id: resourceId,
        limit: '32000',
      },
    });
    return responseData.result.records;
  }

  async getResourceMetadata(resourceId: string) {
    const responseData = await this.ckanGet<Resource>(
      `resource_show?id=${resourceId}`,
      3
    );
    const resourceMetadata: Resource = responseData.result;
    return resourceMetadata;
  }

  async getResourceInfo(resourceId: string) {
    const responseData = await CkanRequest.post<CkanResponse<Array<ResourceInfo>>>(
      'datastore_info',
      {
        ckanUrl: this.DMS,
        json: { resource_id: resourceId },
      }
    );
    const resourceInfo: Array<ResourceInfo> = responseData.result;
    return resourceInfo;
  }

  async getFacetFields(field: 'res_format' | 'tags') {
    const responseData = await this.ckanGet<{
      facets?: Record<string, Record<string, number>>;
    }>(`package_search?facet.field=["${field}"]&rows=0`, 3);
    const result = responseData.result?.facets?.[field];
    return Object.keys(result ?? {});
  }
}
